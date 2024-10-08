import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-singin',
  standalone: true,
  imports: [HttpClientModule, ReactiveFormsModule, CommonModule, ToastModule], 
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SigninComponent {
  loginForm: FormGroup;
  loginError: string = ''; 

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router, private messageService: MessageService) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }
  
  ngOnInit(): void {}

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe(
        (response) => {
          this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Inicio de sesión exitoso', life: 1500, closable: false});
          localStorage.setItem('access_token', response.access_token);
          this.router.navigate(['/mySpaces']);
        },
        (error) => {
          this.messageService.add({severity:'error', summary: 'Error', detail: 'Error de inicio de sesión.', life: 1500, closable: false});
        }
      );
    }
  }
}
