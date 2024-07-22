// Load pdf.js

const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js';
script.onload = () => console.log('jsPDF library loaded.');
document.head.appendChild(script);

// Console script - Wait for PDFjs to load

(async function() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Function to wait for a specific page to load
    function waitForPageToLoad(pageNumber) {
        return new Promise(resolve => {
            const page = document.querySelector(`.pdfViewer .page[data-page-number="${pageNumber}"]`);
            if (page && page.dataset.loaded) {
                resolve();
            } else {
                const observer = new MutationObserver(() => {
                    if (page.dataset.loaded) {
                        observer.disconnect();
                        resolve();
                    }
                });
                observer.observe(page, { attributes: true, attributeFilter: ['data-loaded'] });
            }
        });
    }

    // Get total number of pages
    const totalPages = document.querySelectorAll('.pdfViewer .page').length;

    // Function to scroll to a page and ensure it's fully rendered
    async function scrollToPage(pageNumber) {
        const page = document.querySelector(`.pdfViewer .page[data-page-number="${pageNumber}"]`);
        if (page) {
            page.scrollIntoView({ behavior: 'instant' });
            await waitForPageToLoad(pageNumber);
            await new Promise(resolve => setTimeout(resolve, 500)); // Additional wait time to ensure rendering
        }
    }

    // Scroll to and capture each page in sequence
    for (let i = 1; i <= totalPages; i++) {
        await scrollToPage(i);

        const page = document.querySelector(`.pdfViewer .page[data-page-number="${i}"]`);
        const canvas = page.querySelector('canvas');
        if (canvas) {
            // Create a higher resolution canvas
            const scale = 6; // Adjust this scale to increase resolution
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width * scale;
            tempCanvas.height = canvas.height * scale;
            const ctx = tempCanvas.getContext('2d');
            ctx.scale(scale, scale);
            ctx.drawImage(canvas, 0, 0);

            // Convert to data URL with maximum quality
            const imgData = tempCanvas.toDataURL('image/jpeg', 1.0); // Maximum quality
            const width = pdf.internal.pageSize.getWidth();
            const height = pdf.internal.pageSize.getHeight();

            if (i > 1) pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
        }
    }

    pdf.save('combined_document.pdf');
})();