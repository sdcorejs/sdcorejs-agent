/**
 * The single fixed browser client for the Visual Companion.
 *
 * This is the only script the live surface will execute: the CSP pins it by
 * sha256 hash, so a screen fragment cannot introduce behaviour even if a future
 * authoring bug lets unexpected markup through. Keeping it as one exported
 * string is what makes the hash and the served bytes provably identical.
 */

import { createHash } from 'node:crypto';

export const CLIENT_SCRIPT = `(function () {
  "use strict";
  var root = document.querySelector("[data-visual-companion]");
  if (!root) return;

  var MIN_DELAY = Number(root.dataset.minReconnectMs) || 500;
  var MAX_DELAY = Number(root.dataset.maxReconnectMs) || 15000;
  var PAUSED_AFTER = Number(root.dataset.pausedAfterMs) || 12000;
  var MAX_QUEUE = Number(root.dataset.maxQueue) || 32;

  var sessionId = root.dataset.sessionId;
  var screenId = root.dataset.screenId || null;
  var screenRevision = Number(root.dataset.screenRevision) || 0;
  var multi = root.dataset.mode === "multi_select";

  var options = [].slice.call(root.querySelectorAll("[data-option-id]"));
  var status = root.querySelector("[data-status]");
  var live = root.querySelector("[data-live-status]");
  var feedback = root.querySelector("[data-feedback]");
  var submit = root.querySelector("[data-submit]");

  var socket = null;
  var queue = [];
  var delay = MIN_DELAY;
  var timer = null;
  var disconnectedSince = null;
  var everConnected = false;
  var pausedShown = false;
  var counter = 0;

  function message(name) {
    return root.dataset["message" + name] || "";
  }

  function setStatus(state) {
    if (!live) return;
    live.textContent = message(state);
    live.dataset.state = state;
  }

  function announce(text) {
    if (status) status.textContent = text;
  }

  function nextDelay(current) {
    return Math.min(current * 2, MAX_DELAY);
  }

  function showPaused() {
    if (pausedShown) return;
    pausedShown = true;
    var overlay = document.createElement("div");
    overlay.className = "vc-paused";
    overlay.setAttribute("role", "alertdialog");
    overlay.setAttribute("aria-live", "assertive");
    var title = document.createElement("h2");
    title.textContent = message("PausedTitle");
    var body = document.createElement("p");
    body.textContent = message("PausedBody");
    var box = document.createElement("div");
    box.className = "vc-paused-box";
    box.appendChild(title);
    box.appendChild(body);
    overlay.appendChild(box);
    if (document.body) document.body.appendChild(overlay);
  }

  function hidePaused() {
    pausedShown = false;
    var overlay = document.querySelector(".vc-paused");
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  function selected() {
    return options
      .filter(function (button) { return button.getAttribute("aria-checked") === "true"; })
      .map(function (button) { return button.dataset.optionId; });
  }

  function send(type) {
    counter += 1;
    var event = {
      schema_version: 1,
      event_id: "e" + screenRevision + "-" + counter + "-" + Math.random().toString(36).slice(2, 10),
      session_id: sessionId,
      screen_id: screenId,
      screen_revision: screenRevision,
      event_type: type,
      selected_option_ids: selected(),
      feedback: feedback && feedback.value ? feedback.value : null,
      client_timestamp: Date.now()
    };
    if (socket && socket.readyState === 1) {
      socket.send(JSON.stringify(event));
    } else if (queue.length < MAX_QUEUE) {
      queue.push(event);
    }
  }

  function connect() {
    if (timer) { clearTimeout(timer); timer = null; }
    setStatus(everConnected ? "StatusReconnecting" : "StatusConnecting");
    try {
      socket = new WebSocket("ws://" + window.location.host + "/");
    } catch (error) {
      socket = null;
      scheduleReconnect();
      return;
    }

    socket.onopen = function () {
      var recovered = pausedShown;
      everConnected = true;
      disconnectedSince = null;
      delay = MIN_DELAY;
      hidePaused();
      setStatus("StatusConnected");
      var pending = queue;
      queue = [];
      pending.forEach(function (event) {
        try { socket.send(JSON.stringify(event)); } catch (error) { /* dropped */ }
      });
      if (recovered) window.location.reload();
    };

    socket.onmessage = function (frame) {
      var data;
      try { data = JSON.parse(frame.data); } catch (error) { return; }
      if (data.type === "reload") { window.location.reload(); return; }
      if (data.type === "event-accepted") { announce(message("SelectionSubmitted")); return; }
      if (data.type === "event-rejected") { announce(message("SelectBeforeSubmit")); }
    };

    socket.onclose = function () {
      socket = null;
      scheduleReconnect();
    };

    socket.onerror = function () {
      try { if (socket) socket.close(); } catch (error) { /* already closing */ }
    };
  }

  function scheduleReconnect() {
    if (disconnectedSince === null) disconnectedSince = Date.now();
    if (Date.now() - disconnectedSince >= PAUSED_AFTER) {
      setStatus("StatusPaused");
      showPaused();
    } else {
      setStatus("StatusReconnecting");
    }
    timer = setTimeout(connect, delay);
    delay = nextDelay(delay);
  }

  function choose(button) {
    if (!multi) {
      options.forEach(function (item) { item.setAttribute("aria-checked", "false"); });
      button.setAttribute("aria-checked", "true");
    } else {
      button.setAttribute("aria-checked", button.getAttribute("aria-checked") === "true" ? "false" : "true");
    }
    announce(message("SelectionUpdated"));
    send("selection_changed");
  }

  function move(current, delta) {
    var next = (options.indexOf(current) + delta + options.length) % options.length;
    options[next].focus();
  }

  options.forEach(function (button, index) {
    button.addEventListener("click", function () { choose(button); });
    button.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); move(button, 1); }
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); move(button, -1); }
      else if (event.key === " " || event.key === "Enter") { event.preventDefault(); choose(button); }
      else if (event.key === String(index + 1)) { event.preventDefault(); choose(button); }
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.target === feedback) return;
    var index = Number(event.key) - 1;
    if (index >= 0 && index < options.length) {
      event.preventDefault();
      choose(options[index]);
      options[index].focus();
    }
  });

  if (submit) {
    submit.addEventListener("click", function () {
      if (selected().length === 0) { announce(message("SelectBeforeSubmit")); return; }
      send("selection_submitted");
      announce(message("SelectionSubmitted"));
    });
  }

  if (feedback) {
    feedback.addEventListener("change", function () {
      if (feedback.value) send("feedback");
    });
  }

  connect();
})();
`;

export const CLIENT_SCRIPT_HASH = createHash('sha256').update(CLIENT_SCRIPT).digest('base64');
