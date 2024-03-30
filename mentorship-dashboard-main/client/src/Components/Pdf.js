import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import TableComponent from './TableComponent';

const PDFDocument = () => {
  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document>
        <Page size="A4">
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default PDFDocument;
