export const postEntry = (store, id) => store.transaction(tx => tx.post(id));
