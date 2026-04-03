import { CanActivateFn } from '@angular/router';

export const sessionGuard: CanActivateFn = (route, state) => {
  return true;
};
