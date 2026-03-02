import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { StockPipe } from './pipes/stock.pipe';

@NgModule({
    declarations: [LoadingSpinnerComponent, StockPipe],
    imports: [CommonModule],
    exports: [LoadingSpinnerComponent, StockPipe],
})
export class SharedModule { }
