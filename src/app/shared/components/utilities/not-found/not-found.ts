import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [TranslateModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1 class="error-title">{{ 'errors.notFound.title' | translate }}</h1>
        <p class="error-message">{{ 'errors.notFound.message' | translate }}</p>

        <div class="error-actions">
          <button mat-raised-button color="primary" routerLink="/dashboard" class="home-button">
            <!-- <mat-icon>home</mat-icon> -->
            {{ 'errors.notFound.goHome' | translate }}
          </button>

          <button mat-stroked-button (click)="goBack()" class="back-button">
            <!-- <mat-icon>arrow_back</mat-icon> -->
            {{ 'errors.notFound.goBack' | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .not-found-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
      }

      .not-found-content {
        text-align: center;
        background: white;
        padding: 3rem 2rem;
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        max-width: 500px;
        width: 100%;
      }

      .error-code {
        font-size: 8rem;
        font-weight: 900;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1;
        margin-bottom: 1rem;
      }

      .error-title {
        font-size: 2rem;
        font-weight: 700;
        color: #374151;
        margin-bottom: 1rem;
      }

      .error-message {
        font-size: 1.125rem;
        color: #6b7280;
        margin-bottom: 2rem;
        line-height: 1.6;
      }

      .error-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      .home-button,
      .back-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 140px;
      }

      @media (max-width: 640px) {
        .not-found-content {
          padding: 2rem 1rem;
        }

        .error-code {
          font-size: 6rem;
        }

        .error-title {
          font-size: 1.5rem;
        }

        .error-actions {
          flex-direction: column;
          align-items: center;
        }

        .home-button,
        .back-button {
          width: 100%;
          max-width: 200px;
        }
      }
    `,
  ],
})
export class NotFound {
  public goBack(): void {
    window.history.back();
  }
}
