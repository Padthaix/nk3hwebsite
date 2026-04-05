/**
 * Script for fetching and rendering dynamic content.
 * Right now it uses MOCK_DATA, but will later be replaced with a fetch() call to Google Apps Script.
 */

// This represents the data that will be sent back from Google Apps Script
const MOCK_API_DATA = {
    profile: {
        logoName: "ARCH.Studio",
        title: "T. Chayapol",
        subtitle: "Architect & Interior Designer",
        description: "เรารังสรรค์พื้นที่ว่างให้กลายเป็นประสบการณ์ที่น่าจดจำ ผสมผสานฟังก์ชันการใช้งานเข้ากับความงามที่เรียบง่ายและยั่งยืน (ข้อความตรงนี้แก้ไขจาก Google Sheets ได้เลย)"
    },
    contact: {
        email: "hello@example.com",
        phone: "+66 80 000 0000",
        address: "Bangkok, Thailand",
        instagram: "@architect_studio"
    },
    // The beautiful part: Any category added here automatically appears!
    categories: [
        {
            name: "งานสถาปัตย์",
            images: [
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
            ]
        },
        {
            name: "งานระบบภายใน",
            images: [
                "https://images.unsplash.com/photo-1628156690748-1127aa2e8ae8?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"
            ]
        },
        {
            name: "อื่นๆ",
            images: [
                "https://images.unsplash.com/photo-1498656608930-67a96d194cf9?auto=format&fit=crop&w=800&q=80"
            ]
        }
    ]
};

const API_URL = "https://script.google.com/macros/s/AKfycbwzr7gtJi1-QpEVy6AP-aoy5vbFU-s_YiZuwm6fuKYuMSKyiHiHjyJSbtaFORQL3C3IPA/exec";

document.addEventListener('DOMContentLoaded', () => {
    // Set Current Year in Footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // 1. Fetch live data from Google API
    fetchData();
});

async function fetchData() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        loadData(data);
        
    } catch (error) {
        console.error("Error fetching live data from Google Sheets:", error);
        
        // Fallback to our dummy data so the site doesn't look broken
        loadData(MOCK_API_DATA);
        
        alert("⚠️ แจ้งเตือนจากระบบ: \nไม่สามารถเข้าถึงข้อมูลบน Google Sheets ได้\n\nสาเหตุหลักคือตอนที่คุณ Deploy Google Apps Script น่าจะลืมตั้งค่า 'สิทธิ์การเข้าถึง (Who has access)' เป็น 'ทุกคน (Anyone)' ครับ\n\nรบกวนกลับไปทำตามขั้นตอนใหม่อีกครั้ง แล้วระบบจะเชื่อมต่อสำเร็จและข้อความนี้จะหายไปครับ");
    } finally {
        // Fade out the loading screen smoothly
        const loader = document.getElementById('premium-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.visibility = 'hidden';
                loader.style.display = 'none';
            }, 800);
        }
    }
}

function loadData(data) {
    // Populate Profile
    document.getElementById('site-logo').textContent = data.profile.logoName;
    document.getElementById('bio-title').textContent = data.profile.title;
    document.getElementById('bio-subtitle').textContent = data.profile.subtitle;
    document.getElementById('bio-description').textContent = data.profile.description;

    // Populate Contact
    const contactHtml = `
        <p><strong>Email:</strong> <a href="mailto:${data.contact.email}">${data.contact.email}</a></p>
        <p><strong>Phone:</strong> ${data.contact.phone}</p>
        <p><strong>Location:</strong> ${data.contact.address}</p>
    `;
    document.getElementById('contact-info').innerHTML = contactHtml;

    // Populate Categories & Images
    renderGallery(data.categories);
}

function renderGallery(categories) {
    const filtersContainer = document.getElementById('category-filters');
    const gridContainer = document.getElementById('gallery-grid');
    
    // Add "All" filter button
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.textContent = 'All Works';
    allBtn.dataset.filter = 'all';
    filtersContainer.appendChild(allBtn);

    // Track all images
    let allImagesHTML = '';

    categories.forEach((category, catIndex) => {
        const catId = `cat-${catIndex}`;

        // Create Category Button dynamically based on Data! 
        // This answers: "หัวข้อข้างบนอาจจะเพิ่มเองตามใจลูกค้าเป็นไปได้ไหม"
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = category.name;
        btn.dataset.filter = catId;
        filtersContainer.appendChild(btn);

        // Create Images for this category
        category.images.forEach(imgUrl => {
            allImagesHTML += `
                <div class="gallery-item" data-category="${catId}">
                    <img src="${imgUrl}" alt="${category.name} Work" loading="lazy">
                </div>
            `;
        });
    });

    gridContainer.innerHTML = allImagesHTML;

    // Setup filtering logic
    setupFilters();
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked
            btn.classList.add('active');

            const filterValue = btn.dataset.filter;

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.dataset.category === filterValue) {
                    item.classList.remove('hidden');
                    // Reset animation trick
                    item.style.animation = 'none';
                    item.offsetHeight; /* trigger reflow */
                    item.style.animation = null; 
                    item.classList.add('fade-in');
                } else {
                    item.classList.add('hidden');
                    item.classList.remove('fade-in');
                }
            });
        });
    });
}
