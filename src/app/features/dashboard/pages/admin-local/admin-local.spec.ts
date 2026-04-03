import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLocal } from './admin-local';

describe('AdminLocal', () => {
  let component: AdminLocal;
  let fixture: ComponentFixture<AdminLocal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLocal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminLocal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
