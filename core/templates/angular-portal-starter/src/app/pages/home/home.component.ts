import { Component } from '@angular/core';
import { SdPageComponent } from '@sd-angular/core/modules';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [SdPageComponent],
  template: `
    <sd-page title="Home">
      <div class="p-16">
        Trang home starter. Ban co the custom noi dung theo du an va cap nhat homeUrl trong LayoutConfiguration.
      </div>
    </sd-page>
  `,
})
export class HomeComponent {}
