import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ITabItem } from "./tab.interface";
import { trackById } from "../../helpers/trackByFn.helper";

@Component({
    selector: "app-tabs",
    templateUrl: "./tabs.component.html",
    styleUrls: ["./tabs.component.scss"],
    standalone: true,
    imports: [CommonModule],
})
export class TabsComponent {
    @Input() tabs: ITabItem[] = [];
    @Input() activeTabId = "";
    @Input() ariaLabel: string | null = null;
    @Output() activeTabIdChange = new EventEmitter<string>();
    trackById = trackById;

    selectTab(tabId: string): void {
        if (this.activeTabId !== tabId) {
            this.activeTabId = tabId;
            this.activeTabIdChange.emit(tabId);
        }
    }
}
