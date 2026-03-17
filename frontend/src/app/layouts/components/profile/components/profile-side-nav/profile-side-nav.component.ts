import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProfileSections } from "../../../../enums/profile-sections.enum";
import { trackById } from "../../../../../shared/helpers/trackByFn.helper";

interface NavItem {
    section: ProfileSections;
    icon: string;
    label: string;
}

@Component({
    selector: 'app-profile-side-nav',
    templateUrl: './profile-side-nav.component.html',
    styleUrls: ['./profile-side-nav.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class ProfileSideNavComponent {
    @Input() activeSection: ProfileSections = ProfileSections.PERSONAL_DATA;
    @Output() sectionChange = new EventEmitter<ProfileSections>();

    ProfileSections = ProfileSections;
    trackById = trackById;

    navItems: NavItem[] = [
        { section: ProfileSections.PERSONAL_DATA, icon: 'bi-person-circle', label: 'Personal Data' },
    ];

    onSectionClick(section: ProfileSections): void {
        this.sectionChange.emit(section);
    }
}

