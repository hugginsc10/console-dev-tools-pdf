// Script to load file saver
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js';
script.onload = () => console.log('FileSaver.js library loaded.');
document.head.appendChild(script);


// script to download pages as png
(async function() {
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

    // Scroll to and download each page in sequence
    for (let i = 1; i <= totalPages; i++) {
        await scrollToPage(i);

        const page = document.querySelector(`.pdfViewer .page[data-page-number="${i}"]`);
        const canvas = page.querySelector('canvas');
        if (canvas) {
            const imgData = canvas.toDataURL('image/png'); // Use PNG for better quality
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `page-${i}.png`;
            link.click();
        }
    }
})();

// Script to load jsPDF
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js';
script.onload = () => console.log('jsPDF library loaded.');
document.head.appendChild(script);

// Script to combine pngs to pdf
(async function() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Load each PNG and add it to the PDF
    for (let i = 1; i <= 27; i++) { // Adjust total number of pages as needed
        const img = new Image();
        img.src = `page-${i}.png`; // Ensure the correct file paths
        await new Promise(resolve => {
            img.onload = () => {
                const width = pdf.internal.pageSize.getWidth();
                const height = pdf.internal.pageSize.getHeight();
                if (i > 1) pdf.addPage();
                pdf.addImage(img, 'PNG', 0, 0, width, height);
                resolve();
            };
        });
    }

    pdf.save('combined_document.pdf');
})();

// script to combine pngs from downloads to pdf
(async function() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Function to read a file and return its data URL
    async function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Get the list of PNG files from the user
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png';
    input.multiple = true;
    input.onchange = async (event) => {
        const files = Array.from(event.target.files).sort((a, b) => {
            // Sort files by name (assuming they are named in sequence)
            const aNum = parseInt(a.name.match(/\d+/), 10);
            const bNum = parseInt(b.name.match(/\d+/), 10);
            return aNum - bNum;
        });

        // Load each PNG and add it to the PDF
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const imgData = await readFileAsDataURL(file);
            const img = new Image();
            img.src = imgData;
            await new Promise(resolve => {
                img.onload = () => {
                    const width = pdf.internal.pageSize.getWidth();
                    const height = pdf.internal.pageSize.getHeight();
                    if (i > 0) pdf.addPage();
                    pdf.addImage(img, 'PNG', 0, 0, width, height);
                    resolve();
                };
            });
        }

        pdf.save('combined_document.pdf');
    };

    // Trigger the file input dialog
    input.click();
})();