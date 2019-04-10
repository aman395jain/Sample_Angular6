import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';

@Component({
  selector: 'app-attr-option-selector-modal',
  templateUrl: './attr-option-selector-modal.component.html',
  styleUrls: ['./attr-option-selector-modal.component.css']
})
export class AttrOptionSelectorModalComponent implements OnInit {

    selectedOption: any;

    constructor(public dialogRef: MatDialogRef<AttrOptionSelectorModalComponent>,
            @Inject(MAT_DIALOG_DATA) public data: any,
            private orderConfigService: OrderConfigService,
    ) {
        this.data.groupVO.forEach(element => {
            if (element.isSelected === 'Y') {
                this.selectedOption = element;
            }
        });
    }

    ngOnInit() {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    changeBadgeStyle(id) {
        return {'background-color': '#' + this.orderConfigService.getActiveProductDetailsByKey(id).attributePropertyMap['Component Color Code'],
                'color': '#' + this.orderConfigService.getActiveProductDetailsByKey(id).attributePropertyMap['Component Color Code']};
    }

    hasColorCode(id) {
        if (this.orderConfigService.getActiveProductDetailsByKey(id).attributePropertyMap['Component Color Code']) {
            return true;
        } else {
            return false;
        }
    }

    closeDialog() {
        this.dialogRef.close(this.selectedOption);
    }
}
