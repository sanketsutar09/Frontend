import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSignUp } from './user-sign-up';

describe('UserSignUp', () => {
  let component: UserSignUp;
  let fixture: ComponentFixture<UserSignUp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSignUp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserSignUp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
