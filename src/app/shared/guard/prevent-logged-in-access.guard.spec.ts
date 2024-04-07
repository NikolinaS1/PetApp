import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { preventLoggedInAccessGuard } from './prevent-logged-in-access.guard';

describe('preventLoggedInAccessGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => preventLoggedInAccessGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
