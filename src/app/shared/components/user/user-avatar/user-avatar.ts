import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { User } from '@core/models';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-user-avatar',
  imports: [AvatarModule, UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-avatar
      [style.height]="size() + 'rem'"
      [style.width]="size() + 'rem'"
      [shape]="'circle'"
      [image]="user()?.person?.picture || undefined"
      [label]="(user()?.person?.picture ? '' : getInitials()) | uppercase"
      [style.font-size]="textSizeStyleClass()"
    />
  `,
  styles: ``,
})
export class UserAvatar {
  public size = input<number>(3);
  public user = input<User | null>(null);
  public textSizeStyleClass = computed(() => `${this.size() * 5}px`);

  public getInitials(): string {
    const user = this.user();
    if (!user) {
      return '';
    }
    return user.username.charAt(0);
  }
}
