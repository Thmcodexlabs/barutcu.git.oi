 document.addEventListener('DOMContentLoaded', () => {

            // ===============================================
            // GENEL YARDIMCI İŞLEVLER (Sayfa yüklenince çalışır)
            // ===============================================

            // Lucide ikonlarını oluştur (Lucide CDN'i HTML'de yüklüyse çalışır)
            // İKONLARIN ÇALIŞMASI İÇİN BU SATIRI BURAYA TAŞIDIK.
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons();
            }

            // ===============================================
            // 1. ÖZELLİKLER (FEATURES) SECTION Animasyonu (Intersection Observer)
            // ===============================================

            const featureBoxes = document.querySelectorAll('.barutcu-features-section .grid > div');

            if (featureBoxes.length > 0) {
                const observerOptions = {
                    root: null,
                    rootMargin: '0px',
                    threshold: 0.1
                };

                featureBoxes.forEach((box, index) => {
                    // Kademeli animasyon gecikmesi
                    box.style.transitionDelay = `${index * 0.1}s`;
                });

                const observer = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                            observer.unobserve(entry.target);
                        }
                    });
                }, observerOptions);

                featureBoxes.forEach(box => {
                    observer.observe(box);
                });
            }


            // ===============================================
            // 2. TIMELINE Animasyonu (Intersection Observer ve Scroll Calculation)
            // ===============================================

            const timelineWrapper = document.getElementById('timeline-content-wrapper');
            const animatedLine = document.getElementById('timeline-line-animated');
            const timelineEntries = document.querySelectorAll('.timeline-entry');
            const staticLineBg = document.getElementById('timeline-line-bg');

            if (timelineWrapper && animatedLine && staticLineBg && timelineEntries.length > 0) {

                // --- 2.1. Dinamik Yuvarlak Vurgulama (Intersection Observer) ---
                const dotObserverOptions = {
                    root: null,
                    // Giriş noktası: viewport'un ortası
                    rootMargin: '0px 0px -50% 0px',
                    threshold: 0
                };

                const dotObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        const dot = entry.target.querySelector('.timeline-dot');
                        if (dot) {
                            if (entry.isIntersecting) {
                                dot.classList.add('active');
                            } else {
                                // Geçenleri sadece yukarı kaydırırken deaktif et
                                if (entry.boundingClientRect.top > 0) {
                                    dot.classList.remove('active');
                                }
                            }
                        }
                    });
                }, dotObserverOptions);

                timelineEntries.forEach(entry => {
                    dotObserver.observe(entry);
                });


                // --- 2.2. Akıcı Çizgi Animasyonu (Scroll Calculation) ---
                const handleScroll = () => {
                    const timelineHeight = timelineWrapper.offsetHeight;
                    const containerRect = timelineWrapper.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;

                    // Başlangıç noktası: Timeline wrapper'ın üstü, viewport'un %10 altındayken
                    const startY = containerRect.top - (0.10 * viewportHeight);
                    // Bitiş noktası: Timeline wrapper'ın altı, viewport'un %50 altındayken
                    const endY = containerRect.height + containerRect.top - (0.50 * viewportHeight);

                    let scrollProgress = 0;

                    if (containerRect.top < viewportHeight && containerRect.bottom > 0) {
                        const totalDistance = endY - startY;
                        const scrolledDistance = -startY;

                        scrollProgress = Math.min(1, Math.max(0, scrolledDistance / totalDistance));
                    }

                    const animatedHeight = scrollProgress * timelineHeight;
                    animatedLine.style.height = `${animatedHeight}px`;

                    // Çizgi ilk açıldığında akıcı bir geçiş/görünürlük ekler
                    const opacityProgress = Math.min(1, scrollProgress / 0.1);
                    animatedLine.style.opacity = opacityProgress;
                };

                // Yükseklik ve Scroll Ayarları (Responsive)
                let resizeTimer;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(() => {
                        const newHeight = timelineWrapper.offsetHeight;
                        staticLineBg.style.height = newHeight + 'px';
                        handleScroll();
                    }, 250);
                });

                // Sayfa yüklendiğinde statik çizgiyi ayarla
                staticLineBg.style.height = timelineWrapper.offsetHeight + 'px';

                window.addEventListener('scroll', handleScroll);
                handleScroll(); // Sayfa yüklendiğinde bir kere çalıştır
            }

            // ===============================================
            // 3. KARUSEL İŞLEVİ VE OTOMATİK GEÇİŞ (Hero Slider)
            // ===============================================

            const slider = document.querySelector('.slider');
            const navElement = document.querySelector('.nav');
            const autoSlideInterval = 5000;
            let slideTimer;

            if (slider && navElement) {

                function nextSlide() {
                    const items = document.querySelectorAll('.item');
                    if (items.length > 0) {
                        slider.append(items[0]);
                        updateContentVisibility();
                    }
                }

                function updateContentVisibility() {
                    document.querySelectorAll('.content').forEach(content => {
                        content.style.opacity = '0';
                        content.style.display = 'none';
                        content.style.animation = 'none';
                    });

                    const secondItemContent = document.querySelector('.item:nth-of-type(2) .content');
                    if (secondItemContent) {
                        secondItemContent.style.display = 'block';
                        secondItemContent.style.animation = 'none';
                        void secondItemContent.offsetWidth; // Reflow zorlama
                        secondItemContent.style.animation = 'show 0.75s ease-in-out 0.3s forwards';
                    }
                }

                function activate(e) {
                    clearInterval(slideTimer);

                    const items = document.querySelectorAll('.item');
                    if (e.target.matches('.next') || e.target.parentElement.matches('.next')) {
                        slider.append(items[0]);
                    } else if (e.target.matches('.prev') || e.target.parentElement.matches('.prev')) {
                        slider.prepend(items[items.length - 1]);
                    }

                    updateContentVisibility();

                    slideTimer = setInterval(nextSlide, autoSlideInterval);
                }

                navElement.addEventListener('click', activate, false);

                // Başlangıç ayarları
                slideTimer = setInterval(nextSlide, autoSlideInterval);
                updateContentVisibility();
            }

            // ===============================================
            // 4. MENÜ İŞLEVİ (Full Screen Menu)
            // ===============================================

            const menu = document.getElementById('fullScreenMenu');
            const toggleButton = document.getElementById('menuToggleButton');
            const toggleText = document.getElementById('toggleText');

            if (menu && toggleButton && toggleText) {

                window.toggleMenu = function () { // 'event' parametresini kaldırdık
                    const isOpen = menu.classList.toggle('is-open');
                    toggleButton.classList.toggle('is-active', isOpen);

                    if (isOpen) {
                        toggleText.textContent = 'K A P A T';
                        document.addEventListener('click', closeMenuOnOutsideClick);
                        // Menü açıldığında otomatik slaytı durdur
                        if (slideTimer) clearInterval(slideTimer);
                    } else {
                        toggleText.textContent = 'MENÜ';
                        document.removeEventListener('click', closeMenuOnOutsideClick);
                        // Menü kapandığında otomatik slaytı yeniden başlat
                        if (slider) slideTimer = setInterval(nextSlide, autoSlideInterval);
                    }
                }

                function closeMenuOnOutsideClick(event) {
                    const isClickInsideMenu = menu.contains(event.target);
                    const isClickOnToggle = toggleButton.contains(event.target);

                    if (!isClickInsideMenu && !isClickOnToggle && menu.classList.contains('is-open')) {
                        toggleMenu();
                    }
                }

                toggleText.textContent = 'MENÜ';
            }





            // ===============================================
            // 6. İLETİŞİM FORMU İŞLEVİ (Simülasyon)
            // ===============================================

            const contactForm = document.getElementById('contactForm');

            if (contactForm) {
                contactForm.addEventListener('submit', function (event) {
                    event.preventDefault();

                    const submitButton = document.getElementById('submitButton');
                    const formStatus = document.getElementById('formStatus');

                    if (!this.checkValidity()) {
                        formStatus.textContent = 'Lütfen tüm zorunlu alanları doldurun.';
                        formStatus.className = 'text-center text-sm font-semibold text-red-500';
                        return;
                    }

                    submitButton.disabled = true;
                    submitButton.textContent = 'Gönderiliyor...';

                    // --- Form Gönderme Simülasyonu ---
                    setTimeout(() => {
                        submitButton.textContent = 'Başarıyla Gönderildi!';
                        submitButton.classList.remove('bg-indigo-700', 'hover:bg-indigo-600');
                        // Başarılı stilini ekle (CSS'te tanımlı olmalı)
                        submitButton.classList.add('submit-success');

                        formStatus.textContent = 'Mesajınız başarıyla alındı. Teşekkür ederiz!';
                        formStatus.className = 'text-center text-sm font-semibold text-green-400';

                        this.reset();

                        setTimeout(() => {
                            submitButton.disabled = false;
                            submitButton.textContent = 'Mesajı Gönder';
                            submitButton.classList.remove('submit-success');
                            submitButton.classList.add('bg-indigo-700', 'hover:bg-indigo-600');
                            formStatus.classList.add('hidden');
                        }, 5000);

                    }, 2000);
                });
            }


        });








        document.addEventListener('DOMContentLoaded', () => {
            const logoContainer = document.querySelector('.logo-link-container');
            // Gölgenin ne zaman ekleneceğini belirleyen scroll eşiği (örneğin 50 piksel)
            const scrollThreshold = 50;

            // Scroll olayını dinleyen fonksiyon
            function handleScroll() {
                // document.documentElement.scrollTop veya document.body.scrollTop
                const scrolledDistance = window.scrollY;

                if (scrolledDistance > scrollThreshold) {
                    // Eşik aşıldıysa, gölge sınıfını ekle
                    logoContainer.classList.add('scrolled-shadow');
                } else {
                    // Eşik aşılmadıysa veya en üstteyse, gölge sınıfını kaldır
                    logoContainer.classList.remove('scrolled-shadow');
                }
            }

            // Sayfa kaydırma olay dinleyicisini ekle
            window.addEventListener('scroll', handleScroll);

            // Sayfa yüklendiğinde bir kere kontrol et (sayfa yenilenince scroll pozisyonu değişmiş olabilir)
            handleScroll();
        });





        const form = document.getElementById('contactForm');
        const success = document.getElementById('successMsg');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                success.style.display = 'block';
                form.reset();
            } else {
                alert('Mesaj gönderilirken hata oluştu');
            }
        });







        const blurObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const spans = entry.target.querySelectorAll('span');
                    spans.forEach((span, i) => {
                        setTimeout(() => span.classList.add('show'), i * 150);
                    });
                    blurObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        blurObserver.observe(document.getElementById('blurText'));

        /* ===============================
           SCROLL ACTIVE IMAGE
        ================================ */
        document.addEventListener("DOMContentLoaded", () => {
            const items = document.querySelectorAll(".gallery__link");

            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        items.forEach(i => i.classList.remove("is-active"));
                        entry.target.classList.add("is-active");
                    }
                });
            }, { threshold: 0.55 });

            items.forEach(item => observer.observe(item));
        });









        /* ===============================
           MODAL İŞLEVSELLİĞİ (AÇIKLAMA YÜKLEME) - DÜZELTİLMİŞ KISIM
        ================================ */
        // Modal elementlerini tanımla (HTML'de ID'leri kontrol et!)
        const modal = document.getElementById("imageModal");
        const modalImg = document.getElementById("modalImage");
        // Eksik olan Başlık ve Açıklama elementlerini tanımla
        const modalTitle = document.getElementById("modalTitle");
        const modalDescription = document.getElementById("modalDescription");
        const closeBtn = document.querySelector(".modal-close");


        document.querySelectorAll(".img-plus").forEach(btn => {
            btn.addEventListener("click", e => {
                e.preventDefault();
                e.stopPropagation();

                const parentLink = btn.closest('.gallery__link'); // Tıklanan A etiketini bul

                // Verileri A etiketindeki data niteliklerinden çekme
                const imgSrc = parentLink.querySelector('.gallery__image').src;
                const projectTitle = parentLink.getAttribute('data-title');
                const projectInfo = parentLink.getAttribute('data-info');

                // 1. Resmi yükle (Mevcut kodunuzdaki gibi)
                modalImg.src = imgSrc;

                // 2. Başlık ve Açıklamayı yükle (Eksik olan kısım)
                modalTitle.textContent = projectTitle;
                modalDescription.textContent = projectInfo;

                // Modalı açma
                modal.classList.add("active");
                document.body.style.overflow = 'hidden'; // Sayfayı dondur

            });
        });

        // Kapatma Fonksiyonları
        closeBtn.addEventListener("click", () => {
            modal.classList.remove("active");
            document.body.style.overflow = 'auto'; // Sayfa kaydırmayı aç
        });

        modal.addEventListener("click", e => {
            if (e.target === modal) {
                modal.classList.remove("active");
                document.body.style.overflow = 'auto'; // Sayfa kaydırmayı aç
            }
        });


        /* ===============================
           DEVAMINI GÖR İŞLEVSELLİĞİ - MEVCUT KODUNUZ
        ================================ */
        const btn = document.getElementById("galleryMore");
        const items = document.querySelectorAll(".gallery__link"); // items burada yeniden tanımlanıyor
        let opened = false;

        btn.addEventListener("click", () => {
            opened = !opened;

            items.forEach((item, i) => {
                if (opened) {
                    // Aç
                    setTimeout(() => item.classList.add("visible"), i * 120);
                } else {
                    // Kapat (Sadece responsive başlangıçta görünür olanları hariç tutar)
                    const isResponsiveVisible =
                        (window.innerWidth < 768 && i < 2) ||
                        (window.innerWidth >= 768 && window.innerWidth < 1024 && i < 3) ||
                        (window.innerWidth >= 1024 && i < 4);

                    if (!isResponsiveVisible) {
                        setTimeout(() => item.classList.remove("visible"), i * 80);
                    }
                }
            });

            btn.textContent = opened ? "Küçült" : "Devamını Gör";

            if (!opened) {
                setTimeout(() => {
                    document.querySelector(".gallery").scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }, 400);
            }
        });



        /* REVEAL + TIMELINE ANIMATION */
        const observer = new IntersectionObserver(e => {
            e.forEach(x => x.isIntersecting && x.target.classList.add("show"));
        }, { threshold: .25 });
        document.querySelectorAll(".reveal,.step").forEach(el => observer.observe(el));

        /* COUNTER */
        document.querySelectorAll(".counter").forEach(c => {
            let done = false;
            new IntersectionObserver(e => {
                if (e[0].isIntersecting && !done) {
                    done = true;
                    let target = +c.dataset.target;
                    let count = 0;
                    let step = Math.ceil(target / 60);
                    const interval = setInterval(() => {
                        count += step;
                        if (count >= target) {
                            count = target;
                            clearInterval(interval);
                        }
                        c.textContent = count;
                    }, 25);
                }
            }, { threshold: .6 }).observe(c);
        });