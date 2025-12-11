import { Injectable } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

@Injectable()
export class ReportsService {
    private printer: PdfPrinter;

    constructor() {
        // Configuración de fuentes estándar para evitar dependencias de archivos locales por ahora
        const fonts = {
            Helvetica: {
                normal: 'Helvetica',
                bold: 'Helvetica-Bold',
                italics: 'Helvetica-Oblique',
                bolditalics: 'Helvetica-BoldOblique'
            }
        };
        this.printer = new PdfPrinter(fonts);
    }

    private formatCurrency(amount: any, decimals: number = 0): string {
        return Number(amount || 0).toLocaleString('es-PY', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    async generateAjustesList(data: any[], filters: any, detailed: boolean = false): Promise<Buffer> {
        let tableBody: any[] = [];

        // --- 1. Definición de Columnas ---
        const headers = [
            { text: 'Nº Comp', style: 'tableHeader' },
            { text: 'Fecha', style: 'tableHeader' },
            { text: 'Sucursal', style: 'tableHeader' },
            { text: 'Usuario', style: 'tableHeader' },
            { text: 'Motivo', style: 'tableHeader' },
            { text: 'Tot. Local', style: 'tableHeader', alignment: 'right' },
            { text: 'Tot. Extr.', style: 'tableHeader', alignment: 'right' }
        ];
        tableBody.push(headers);

        // --- 2. Procesamiento de Datos ---
        data.forEach(item => {
            const row = [
                { text: item.numero_comprobante, style: detailed ? 'groupHeader' : 'bodyText' },
                { text: new Date(item.fecha_documento).toLocaleDateString(), style: detailed ? 'groupHeader' : 'bodyText' },
                { text: item.sucursal?.nombre || '', style: detailed ? 'groupHeader' : 'bodyText' },
                { text: item.usuario?.alias || '', style: detailed ? 'groupHeader' : 'bodyText' },
                { text: item.motivo_ajuste_inventario?.nombre || '', style: detailed ? 'groupHeader' : 'bodyText' },
                { text: this.formatCurrency(item.total_ml, 0), style: detailed ? 'groupHeader' : 'bodyText', alignment: 'right' },
                { text: this.formatCurrency(item.total_me, 2), style: detailed ? 'groupHeader' : 'bodyText', alignment: 'right' }
            ];
            tableBody.push(row);

            // Detalles
            if (detailed && item.movimiento_stock_detalle && item.movimiento_stock_detalle.length > 0) {
                const detallesBody = [
                    [
                        { text: 'Código', style: 'detailHeader' },
                        { text: 'Artículo', style: 'detailHeader' },
                        { text: 'Cant', style: 'detailHeader', alignment: 'right' },
                        { text: 'Costo ML', style: 'detailHeader', alignment: 'right' },
                        { text: 'Subtotal ML', style: 'detailHeader', alignment: 'right' },
                        { text: 'Subtotal ME', style: 'detailHeader', alignment: 'right' }
                    ],
                    ...item.movimiento_stock_detalle.map(det => [
                        { text: det.articulo?.codigo_alfanumerico || '-', style: 'detailRow' },
                        { text: det.articulo?.nombre || '-', style: 'detailRow' },
                        { text: Number(det.cantidad).toLocaleString('es-PY'), style: 'detailRow', alignment: 'right' },
                        { text: this.formatCurrency(det.costo_ml, 0), style: 'detailRow', alignment: 'right' },
                        { text: this.formatCurrency(det.importe_ml, 0), style: 'detailRow', alignment: 'right' },
                        { text: this.formatCurrency(det.importe_me, 2), style: 'detailRow', alignment: 'right' }
                    ])
                ];

                tableBody.push([{
                    colSpan: 7,
                    table: {
                        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
                        body: detallesBody
                    },
                    layout: 'lightHorizontalLines',
                    margin: [40, 0, 0, 10]
                }, '', '', '', '', '', '']);
            }
        });

        // --- 3. Filtros Legibles ---
        const filterTextParts: string[] = [];
        if (filters.fecha_desde) filterTextParts.push(`Desde: ${filters.fecha_desde}`);
        if (filters.fecha_hasta) filterTextParts.push(`Hasta: ${filters.fecha_hasta}`);
        if (filters.detallado === 'true' || filters.detallado === true) filterTextParts.push(`Vista: Detallada`);
        const filterText = filterTextParts.length > 0 ? filterTextParts.join('  |  ') : 'Sin filtros';

        const docDefinition: TDocumentDefinitions = {
            defaultStyle: { font: 'Helvetica', fontSize: 9 },
            pageOrientation: 'landscape',
            pageMargins: [30, 30, 30, 30],
            content: [
                // Header Block
                {
                    table: {
                        widths: ['*', 'auto'],
                        body: [
                            [
                                {
                                    text: 'EMPRESA DEMO S.A.',
                                    style: 'companyName'
                                },
                                {
                                    text: `Fecha: ${new Date().toLocaleString()}`,
                                    style: 'metadata',
                                    alignment: 'right'
                                }
                            ],
                            [
                                {
                                    text: 'LISTADO DE AJUSTES DE INVENTARIO',
                                    style: 'reportTitle',
                                    colSpan: 2,
                                    alignment: 'center',
                                    margin: [0, 5, 0, 5]
                                },
                                ''
                            ],
                            [
                                {
                                    text: `Filtros Aplicados: ${filterText}`,
                                    style: 'metadata',
                                    colSpan: 2,
                                    fillColor: '#f8f9fa',
                                    margin: [0, 5, 0, 10]
                                },
                                ''
                            ]
                        ]
                    },
                    layout: 'noBorders'
                },

                // Main Table
                {
                    table: {
                        headerRows: 1,
                        widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto'],
                        body: tableBody
                    },
                    layout: {
                        hLineWidth: (i, node) => (i === 0 || i === 1) ? 1 : 0.5,
                        vLineWidth: (i, node) => 0,
                        hLineColor: (i, node) => (i === 0 || i === 1) ? 'black' : '#cccccc',
                        paddingTop: (i) => 4,
                        paddingBottom: (i) => 4
                    }
                }
            ],
            styles: {
                companyName: { fontSize: 12, bold: true, color: '#333' },
                reportTitle: { fontSize: 16, bold: true, color: '#0056b3' }, // Azul corporativo
                metadata: { fontSize: 8, color: '#666' },
                tableHeader: { bold: true, fontSize: 9, color: 'white', fillColor: '#343a40', alignment: 'center' }, // Dark header
                groupHeader: { bold: true, fontSize: 9, fillColor: '#e9ecef' },
                bodyText: { fontSize: 9 },
                detailHeader: { bold: true, fontSize: 8, color: '#495057', fillColor: '#f1f3f5' },
                detailRow: { fontSize: 8, color: '#495057' }
            }
        };

        return this.createPdfBuffer(docDefinition);
    }

    private createPdfBuffer(docDefinition: TDocumentDefinitions): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
            const chunks: Uint8Array[] = [];

            pdfDoc.on('data', (chunk) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', (err) => reject(err));

            pdfDoc.end();
        });
    }
}
