(function () {
    function printWhenReady() {
        if (typeof PDFViewerApplication !== 'undefined' && 
            null !== PDFViewerApplication.pdfViewer &&
            PDFViewerApplication.pdfViewer.pageViewsReady) { 
            if (PDFViewerApplication.documentInfo.Title === 'Solution Builder Ticket') {
                window.print();
             }
        }
        else {
            window.setTimeout(printWhenReady, 500);
        }
    };
    printWhenReady();
})();