import { Component, OnInit } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "../../shared/shared.module";
import { IFieldControl } from "../../shared/interfaces/IFieldControl.interface";
import { InputTypes } from "../../shared/enums/input-types.enum";
import { ReactiveFormService } from "../../shared/services/reactive-form.service";
import { RouterLink } from "@angular/router";

@Component({
    selector: 'app-login',
    standalone: true,
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [SharedModule, ReactiveFormsModule, RouterLink],
})
export class LoginComponent implements OnInit {
    form: FormGroup = new FormGroup({});
    fields: IFieldControl[] = [
        {
            label: 'Email',
            type: InputTypes.EMAIL,
            formControlName: 'email',
            placeholder: 'Enter your email',
            value: '',
            required: true,
            validations: [],
        },
        {
            label: 'Password',
            type: InputTypes.TEXT,
            formControlName: 'password',
            placeholder: 'Enter your password',
            value: '',
            required: true,
            validations: [],
        },
    ];
    constructor(
        private readonly _formService: ReactiveFormService,
    ) {}

    ngOnInit(): void {
        this.initForm();
    }

    private initForm(): void {
        this.form = this._formService.initializeForm(this.fields);
    }
}