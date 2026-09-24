import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { Product, ProductService } from '@/app/pages/service/product.service';

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

@Component({
    selector: 'app-crud',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        RatingModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        TooltipModule
    ],
    template: `
        <div class="crud-page">

            <p-toolbar styleClass="crud-toolbar">
                <ng-template #start>
                    <div class="toolbar-actions">
                        <p-button
                            label="New Product"
                            icon="pi pi-plus"
                            severity="secondary"
                            (onClick)="openNew()"
                        />

                        <p-button
                            label="Delete Selected"
                            icon="pi pi-trash"
                            severity="secondary"
                            outlined
                            [disabled]="!selectedProducts?.length"
                            (onClick)="deleteSelectedProducts()"
                        />
                    </div>
                </ng-template>

                <ng-template #end>
                    <p-button
                        label="Export"
                        icon="pi pi-upload"
                        severity="secondary"
                        (onClick)="exportCSV()"
                    />
                </ng-template>
            </p-toolbar>

            <p-table
                #dt
                [value]="products()"
                [rows]="10"
                [columns]="cols"
                [paginator]="true"
                [globalFilterFields]="[
                    'name',
                    'category',
                    'inventoryStatus'
                ]"
                [tableStyle]="{ 'min-width': '75rem' }"
                [(selection)]="selectedProducts"
                [rowHover]="true"
                dataKey="id"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                [showCurrentPageReport]="true"
                [rowsPerPageOptions]="[10, 20, 30]"
                styleClass="product-table"
            >

                <ng-template #caption>
                    <div class="table-heading">

                        <div class="table-title">
                            <h2>Manage Products</h2>
                            <span>View and manage your product inventory</span>
                        </div>

                        <div class="table-search">
                            <p-iconfield>
                                <p-inputicon styleClass="pi pi-search" />

                                <input
                                    pInputText
                                    type="text"
                                    class="search-input"
                                    [value]="globalFilterValue"
                                    (input)="onGlobalFilter(dt, $event)"
                                    placeholder="Search products..."
                                />
                            </p-iconfield>
                        </div>

                    </div>
                </ng-template>

                <ng-template #header>
                    <tr>
                        <th class="selection-column">
                            <p-tableHeaderCheckbox />
                        </th>

                        <th class="code-column">
                            Code
                        </th>

                        <th
                            pSortableColumn="name"
                            class="name-column"
                        >
                            Name
                            <p-sortIcon field="name" />
                        </th>

                        <th class="image-column">
                            Image
                        </th>

                        <th
                            pSortableColumn="price"
                            class="price-column"
                        >
                            Price
                            <p-sortIcon field="price" />
                        </th>

                        <th
                            pSortableColumn="category"
                            class="category-column"
                        >
                            Category
                            <p-sortIcon field="category" />
                        </th>

                        <th
                            pSortableColumn="rating"
                            class="rating-column"
                        >
                            Reviews
                            <p-sortIcon field="rating" />
                        </th>

                        <th
                            pSortableColumn="inventoryStatus"
                            class="status-column"
                        >
                            Status
                            <p-sortIcon field="inventoryStatus" />
                        </th>

                        <th class="actions-header">
                            Actions
                        </th>
                    </tr>
                </ng-template>

                <ng-template #body let-product>
                    <tr>

                        <td class="selection-column">
                            <p-tableCheckbox [value]="product" />
                        </td>

                        <td class="code-column">
                            <span class="product-code">
                                {{ product.code || '—' }}
                            </span>
                        </td>

                        <td class="name-column">
                            <div class="product-name">
                                {{ product.name || 'Unnamed Product' }}
                            </div>
                        </td>

                        <td class="image-column">

                            <div class="product-image-wrapper">
                                <img
                                    [src]="getProductImage(product)"
                                    [alt]="product.name || 'Product image'"
                                    class="product-image"
                                    (error)="onImageError($event)"
                                />
                            </div>

                        </td>

                        <td class="price-column">

                            <span class="product-price">
                                {{ product.price || 0 | currency:'EUR':'symbol':'1.0-0' }}
                            </span>

                        </td>

                        <td class="category-column">
                            {{ product.category || '—' }}
                        </td>

                        <td class="rating-column">

                            <p-rating
                                [(ngModel)]="product.rating"
                                [readonly]="true"
                            />

                        </td>

                        <td class="status-column">

                            <div class="status-wrapper">
                                <p-tag
                                    [value]="product.inventoryStatus || 'UNKNOWN'"
                                    [severity]="getSeverity(product.inventoryStatus)"
                                />
                            </div>

                        </td>

                        <td class="actions-column">

                            <div class="row-actions">

                                <p-button
                                    icon="pi pi-pencil"
                                    severity="secondary"
                                    [rounded]="true"
                                    [outlined]="true"
                                    size="small"
                                    (onClick)="editProduct(product)"
                                    pTooltip="Edit product"
                                />

                                <p-button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    [rounded]="true"
                                    [outlined]="true"
                                    (onClick)="deleteProduct(product)"
                                    pTooltip="Delete product"
                                />

                            </div>

                        </td>

                    </tr>
                </ng-template>

                <ng-template #emptymessage>
                    <tr>
                        <td colspan="9">

                            <div class="empty-state">
                                <i class="pi pi-inbox"></i>
                                <strong>No products found</strong>
                                <span>
                                    Try changing your search or add a new product.
                                </span>
                            </div>

                        </td>
                    </tr>
                </ng-template>

            </p-table>

        </div>

        <p-dialog
            [(visible)]="productDialog"
            [style]="{ width: '720px' }"
            [modal]="true"
            header="Product Details"
            styleClass="product-dialog"
            (onHide)="onDialogHide()"
        >

            <ng-template #content>

                <div class="dialog-content">

                    <div
                        class="dialog-image-wrapper"
                        *ngIf="product.image"
                    >
                        <img
                            [src]="getProductImage(product)"
                            [alt]="product.name || 'Product image'"
                            class="dialog-product-image"
                            (error)="onImageError($event)"
                        />
                    </div>

                    <div class="form-field">

                        <label for="name">
                            Product Name
                        </label>

                        <input
                            type="text"
                            pInputText
                            id="name"
                            [(ngModel)]="product.name"
                            required
                            autofocus
                            fluid
                        />

                        <small
                            class="field-error"
                            *ngIf="submitted && !product.name?.trim()"
                        >
                            Name is required.
                        </small>

                    </div>

                    <div class="form-field description-field">

                        <label for="description">
                            Description
                        </label>

                        <textarea
                            id="description"
                            pTextarea
                            [(ngModel)]="product.description"
                            rows="5"
                            fluid
                        ></textarea>

                    </div>

                    <div class="form-field">

                        <label for="inventoryStatus">
                            Inventory Status
                        </label>

                        <p-select
                            [(ngModel)]="product.inventoryStatus"
                            inputId="inventoryStatus"
                            [options]="statuses"
                            optionLabel="label"
                            optionValue="label"
                            placeholder="Select a Status"
                            fluid
                        />

                    </div>

                    <div class="form-field">

                        <label>
                            Category
                        </label>

                        <div class="category-grid">

                            <div class="category-option">
                                <p-radiobutton
                                    id="category1"
                                    name="category"
                                    value="Accessories"
                                    [(ngModel)]="product.category"
                                />
                                <label for="category1">
                                    Accessories
                                </label>
                            </div>

                            <div class="category-option">
                                <p-radiobutton
                                    id="category2"
                                    name="category"
                                    value="Clothing"
                                    [(ngModel)]="product.category"
                                />
                                <label for="category2">
                                    Clothing
                                </label>
                            </div>

                            <div class="category-option">
                                <p-radiobutton
                                    id="category3"
                                    name="category"
                                    value="Electronics"
                                    [(ngModel)]="product.category"
                                />
                                <label for="category3">
                                    Electronics
                                </label>
                            </div>

                            <div class="category-option">
                                <p-radiobutton
                                    id="category4"
                                    name="category"
                                    value="Fitness"
                                    [(ngModel)]="product.category"
                                />
                                <label for="category4">
                                    Fitness
                                </label>
                            </div>

                        </div>

                    </div>

                    <div class="form-grid">

                        <div class="form-field">
                            <label for="price">
                                Price
                            </label>

                            <p-inputnumber
                                id="price"
                                [(ngModel)]="product.price"
                                mode="currency"
                                currency="EUR"
                                locale="de-DE"
                                [minFractionDigits]="0"
                                [maxFractionDigits]="0"
                                fluid
                            />
                        </div>

                        <div class="form-field quantity-field">
                            <label for="quantity">
                                Quantity
                            </label>

                            <p-inputnumber
                                id="quantity"
                                [(ngModel)]="product.quantity"
                                fluid
                            />
                        </div>

                    </div>

                </div>

            </ng-template>

            <ng-template #footer>

                <div class="dialog-footer">

                    <p-button
                        label="Cancel"
                        icon="pi pi-times"
                        text
                        severity="secondary"
                        (onClick)="hideDialog()"
                    />

                    <p-button
                        label="Save"
                        icon="pi pi-save"
                        (onClick)="saveProduct()"
                    />

                </div>

            </ng-template>

        </p-dialog>

        <p-confirmdialog
            [style]="{ width: '720px' }"
        />

        <p-toast />

    `,

    styles: [`

        :host {
            display: block;
            width: 100%;
            font-size: 15px;
        }

        .crud-page {
            width: 100%;
            padding: 2rem;
            overflow-x: auto;
        }

        .crud-toolbar {
            margin-bottom: 2.5rem;
            min-height: 82px;
        }

        .toolbar-actions {
            display: flex;
            align-items: flex-start;
            gap: 1.5rem;
        }

        .table-heading {
            display: flex;
            align-items: flex-start;
            justify-content: flex-end;
            gap: 4rem;
            width: 100%;
            min-height: 95px;
            padding: 1.5rem 2rem 2.5rem;
        }

        .table-title {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-top: 1.5rem;
            margin-right: auto;
            min-width: 300px;
        }

        .table-title h2 {
            margin: 0;
            font-size: 0.95rem;
            line-height: 1;
            font-weight: 400;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .table-title span {
            font-size: 0.7rem;
            line-height: 2;
            color: var(--p-text-muted-color);
        }

        .table-search {
            width: 240px;
            margin-top: 0;
            transform: translateY(18px);
        }

        .search-input {
            width: 100%;
            height: 42px;
        }

        .product-table :is(td, th) {
            vertical-align: top;
            padding: 1.35rem 0.8rem;
        }

        .product-table th {
            font-size: 0.72rem;
            font-weight: 800;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }

        .selection-column {
            width: 4rem;
        }

        .code-column {
            min-width: 9rem;
        }

        .name-column {
            min-width: 16rem;
            max-width: 22rem;
        }

        .image-column {
            width: 115px;
        }

        .price-column {
            min-width: 9rem;
        }

        .category-column {
            min-width: 12rem;
        }

        .rating-column {
            min-width: 12rem;
        }

        .status-column {
            min-width: 12rem;
        }

        .actions-header {
            width: 145px;
            text-align: left;
        }

        .product-code {
            font-family: monospace;
            font-size: 0.7rem;
            color: #a1a1aa;
            white-space: nowrap;
        }

        .product-name {
            font-size: 1rem;
            line-height: 2;
            font-weight: 800;
            color: var(--p-text-color);
            overflow-wrap: anywhere;
        }

        .product-price {
            font-size: 0.85rem;
            font-weight: 400;
            white-space: nowrap;
        }

        .product-image-wrapper {
            width: 90px;
            height: 45px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border-radius: 0;
            background: #ffffff;
            border: 3px solid #e4e4e7;
        }

        .product-image {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: fill;
        }

        .status-wrapper {
            padding-top: 8px;
        }

        .row-actions {
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            gap: 1.25rem;
            min-width: 150px;
        }

        .row-actions p-button:last-child {
            transform: scale(1.2);
        }

        .empty-state {
            min-height: 280px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            gap: 1rem;
            padding-left: 15%;
            color: var(--p-text-muted-color);
        }

        .empty-state i {
            font-size: 3rem;
        }

        .empty-state strong {
            font-size: 0.9rem;
            font-weight: 800;
        }

        .empty-state span {
            font-size: 0.7rem;
            max-width: 280px;
        }

        .dialog-content {
            display: flex;
            flex-direction: column;
            gap: 2rem;
            padding: 2rem 1.5rem;
        }

        .dialog-image-wrapper {
            width: 100%;
            height: 130px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border-radius: 0;
            background: #f4f4f5;
            border: 2px solid #d4d4d8;
        }

        .dialog-product-image {
            width: 100%;
            height: 100%;
            object-fit: fill;
        }

        .form-field {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            min-width: 0;
        }

        .form-field > label {
            font-size: 0.7rem;
            line-height: 1;
            font-weight: 800;
            letter-spacing: 0.06em;
            text-transform: uppercase;
        }

        .description-field {
            margin-top: 1rem;
            margin-bottom: 1rem;
        }

        .field-error {
            color: var(--p-red-500);
            font-size: 0.7rem;
        }

        .category-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1.5rem;
            padding: 1rem 0;
        }

        .category-option {
            display: flex;
            align-items: flex-start;
            gap: 0.8rem;
            white-space: nowrap;
        }

        .category-option label {
            font-size: 0.75rem;
            line-height: 1.8;
        }

        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.4rem;
        }

        .quantity-field {
            transform: translateX(20px);
        }

        .dialog-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.5rem 1.5rem 1rem;
        }

        @media (max-width: 900px) {

            .crud-page {
                padding: 1rem;
            }

            .table-heading {
                flex-direction: row;
                gap: 3rem;
            }

            .table-title {
                min-width: 280px;
            }

            .category-grid {
                grid-template-columns: repeat(2, 1fr);
            }

        }

        @media (max-width: 600px) {

            .crud-page {
                width: 100%;
                padding: 1rem;
                overflow-x: hidden;
            }

            .toolbar-actions {
                gap: 0.25rem;
            }

            .table-heading {
                display: flex;
                flex-direction: row;
                width: 650px;
                gap: 3rem;
            }

            .table-title {
                min-width: 260px;
            }

            .table-search {
                width: 260px;
            }

            .form-grid {
                grid-template-columns: 1fr 1fr;
                gap: 0.2rem;
            }

            .category-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .dialog-content {
                padding: 2rem 0;
            }

            .dialog-footer {
                flex-direction: row;
            }

        }

    `],

    providers: [
        MessageService,
        ProductService,
        ConfirmationService
    ]
})
export class Crud implements OnInit {

    productDialog = false;

    products = signal<Product[]>([]);

    product!: Product;

    selectedProducts: Product[] | null = null;

    submitted = false;

    statuses!: any[];

    globalFilterValue = '';

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols!: Column[];

    private readonly fallbackImage =
        'https://primefaces.org/cdn/primeng/images/demo/product/product-placeholdr.svg';

    constructor(
        private productService: ProductService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadDemoData();
    }

    exportCSV() {
        this.dt?.exportCSV();
    }

    loadDemoData() {

        this.productService.getProducts().then((data) => {
            this.products.set(data ?? []);
        });

        this.statuses = [
            {
                label: 'INSTOCK',
                value: 'instock'
            },
            {
                label: 'LOWSTOCK',
                value: 'lowstock'
            },
            {
                label: 'OUTOFSTOCK',
                value: 'outofstock'
            }
        ];

        this.cols = [
            {
                field: 'code',
                header: 'Code',
                customExportHeader: 'Product Code'
            },
            {
                field: 'name',
                header: 'Name'
            },
            {
                field: 'image',
                header: 'Image'
            },
            {
                field: 'price',
                header: 'Price'
            },
            {
                field: 'category',
                header: 'Category'
            }
        ];

        this.exportColumns = this.cols.map((col) => ({
            title: col.header,
            dataKey: col.field
        }));
    }

    onGlobalFilter(table: Table, event: Event) {

        const value =
            (event.target as HTMLInputElement).value ?? '';

        this.globalFilterValue = value;

        table.filterGlobal(value, 'contains');
    }

    openNew() {

        this.product = {
            name: '',
            description: '',
            category: '',
            inventoryStatus: 'INSTOCK',
            price: 0,
            quantity: 0,
            rating: 0
        };

        this.submitted = false;
        this.productDialog = true;
    }

    editProduct(product: Product) {

        this.product = product;

        this.submitted = false;
        this.productDialog = true;
    }

    hideDialog() {

        this.productDialog = false;
    }

    onDialogHide() {

        this.submitted = false;

        if (this.product) {
            this.product.description =
                this.product.description || '';
        }
    }

    deleteSelectedProducts() {

        if (!this.selectedProducts?.length) {
            return;
        }

        this.confirmationService.confirm({

            message:
                'Are you sure you want to delete the selected products?',

            header: 'Confirm',

            icon: 'pi pi-exclamation-triangle',

            accept: () => {

                const selectedIds =
                    new Set(
                        this.selectedProducts
                            ?.map((product) => product.id)
                            .filter(Boolean)
                    );

                this.products.update((products) =>
                    products.filter(
                        (product) =>
                            !selectedIds.has(product.id)
                    )
                );

                this.selectedProducts = null;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Products Deleted',
                    life: 3000
                });
            }
        });
    }

    deleteProduct(product: Product) {

        this.confirmationService.confirm({

            message:
                `Are you sure you want to delete ${
                    product.name || 'this product'
                }?`,

            header: 'Confirm',

            icon: 'pi pi-exclamation-triangle',

            accept: () => {

                this.products.update((products) =>
                    products.filter(
                        (item) =>
                            item.id !== product.id
                    )
                );

                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Deleted',
                    life: 3000
                });
            }
        });
    }

    findIndexById(id: string): number {

        return this.products().findIndex(
            (product) =>
                product.id === id
        );
    }

    createId(): string {

        const chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        let id = '';

        for (let i = 0; i < 5; i++) {

            id += chars.charAt(
                Math.floor(
                    Math.random() * chars.length
                )
            );
        }

        return id;
    }

    getSeverity(
        status: string
    ): 'success' | 'warn' | 'danger' | 'info' {

        switch (status) {

            case 'INSTOCK':
                return 'success';

            case 'LOWSTOCK':
                return 'warn';

            case 'OUTOFSTOCK':
                return 'danger';

            default:
                return 'info';
        }
    }

    getProductImage(product: Product): string {

        if (!product?.image) {
            return this.fallbackImage;
        }

        return `https://primefaces.org/cdn/primeng/images/demo/product/${product.image}`;
    }

    onImageError(event: Event) {

        const image =
            event.target as HTMLImageElement;

        if (image.src !== this.fallbackImage) {
            image.src = this.fallbackImage;
        }
    }

    saveProduct() {

        this.submitted = true;

        const name =
            this.product.name?.trim();

        if (!name) {
            return;
        }

        const productToSave = {
            ...this.product,
            name
        } as Product;

        if (productToSave.id) {

            this.products.update((products) =>
                products.map((product) =>
                    product.id === productToSave.id
                        ? productToSave
                        : product
                )
            );

            this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Product Updated',
                life: 3000
            });

        } else {

            const newProduct: Product = {
                ...productToSave,
                id: this.createId(),
                image:
                    productToSave.image ||
                    'product-placeholder.svg'
            };

            this.products.update((products) => [
                ...products,
                newProduct
            ]);

            this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Product Created',
                life: 3000
            });
        }

        this.productDialog = false;

        this.product = {} as Product;
    }

}
