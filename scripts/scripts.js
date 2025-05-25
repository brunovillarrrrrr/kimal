/**
 * scripts.js - Versión Premium Pro Kimal
 * Optimizado para rendimiento, accesibilidad y mejores prácticas
 */

document.addEventListener('DOMContentLoaded', () => {
  // Configuración global
  const config = {
    scrollOffset: 100,
    scrollDuration: 800,
    testimonialInterval: 7000,
    notificationDuration: 4000
  };

  // Cache de elementos DOM
  const domCache = {
    menuToggle: document.querySelector('.menu-toggle'),
    nav: document.querySelector('.nav'),
    navbar: document.querySelector('.navbar'),
    contactForm: document.querySelector('.contact-form'),
    testimonials: document.querySelectorAll('.testimonial'),
    scrollTopBtn: document.querySelector('.scroll-to-top'),
    internalLinks: document.querySelectorAll('a[href^="#"]')
  };

  // Utilidades
  const utils = {
    debounce: (func, wait) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    },

    throttle: (func, limit) => {
      let lastFunc;
      let lastRan;
      return (...args) => {
        if (!lastRan) {
          func.apply(this, args);
          lastRan = Date.now();
        } else {
          clearTimeout(lastFunc);
          lastFunc = setTimeout(() => {
            if ((Date.now() - lastRan) >= limit) {
              func.apply(this, args);
              lastRan = Date.now();
            }
          }, limit - (Date.now() - lastRan));
        }
      };
    }
  };

  // Scroll suave mejorado para enlaces internos
  const initSmoothScroll = () => {
    domCache.internalLinks.forEach(anchor => {
      anchor.addEventListener('click', e => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
          // Cerrar menú móvil si está abierto
          if (domCache.nav && domCache.nav.classList.contains('active')) {
            toggleMobileMenu();
          }

          // Scroll con offset para considerar el navbar
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = targetPosition - (domCache.navbar ? domCache.navbar.offsetHeight : 0);

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Cambiar URL sin recargar (mejor para SEO y compartir)
          if (history.pushState) {
            history.pushState(null, null, targetId);
          } else {
            location.hash = targetId;
          }
        }
      });
    });
  };

  // Menú móvil mejorado con accesibilidad
  const toggleMobileMenu = () => {
    if (!domCache.menuToggle || !domCache.nav) return;

    const isExpanded = domCache.menuToggle.getAttribute('aria-expanded') === 'true';
    domCache.menuToggle.setAttribute('aria-expanded', !isExpanded);
    domCache.menuToggle.classList.toggle('active');
    domCache.nav.classList.toggle('active');

    // Bloquear scroll cuando el menú está abierto
    document.body.style.overflow = isExpanded ? '' : 'hidden';
  };

  const initMobileMenu = () => {
    if (domCache.menuToggle && domCache.nav) {
      // Mejora de accesibilidad
      domCache.menuToggle.setAttribute('aria-label', 'Menú de navegación');
      domCache.menuToggle.setAttribute('aria-expanded', 'false');
      domCache.menuToggle.setAttribute('aria-controls', 'nav');

      domCache.menuToggle.addEventListener('click', toggleMobileMenu);

      // Cerrar menú al hacer clic en un enlace
      domCache.nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          if (domCache.nav.classList.contains('active')) {
            toggleMobileMenu();
          }
        });
      });
    }
  };

  // Efecto scroll navbar con debounce para mejor rendimiento
  const handleNavbarScroll = utils.throttle(() => {
    if (!domCache.navbar) return;

    if (window.scrollY > 50) {
      domCache.navbar.classList.add('scrolled');
    } else {
      domCache.navbar.classList.remove('scrolled');
    }
  }, 100);

  // Validación de formulario mejorada
  const validateForm = form => {
    let isValid = true;
    const inputs = form.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      const errorElement = document.createElement('span');
      errorElement.className = 'error-message';
      errorElement.setAttribute('aria-live', 'polite');

      // Eliminar mensajes de error anteriores
      const existingError = input.nextElementSibling;
      if (existingError && existingError.classList.contains('error-message')) {
        existingError.remove();
      }

      if (input.required && !input.value.trim()) {
        input.classList.add('error');
        errorElement.textContent = 'Este campo es obligatorio';
        input.insertAdjacentElement('afterend', errorElement);
        isValid = false;
      } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
        input.classList.add('error');
        errorElement.textContent = 'Por favor, introduce un email válido';
        input.insertAdjacentElement('afterend', errorElement);
        isValid = false;
      } else {
        input.classList.remove('error');
      }
    });

    return isValid;
  };

  const initFormValidation = () => {
    if (!domCache.contactForm) return;

    domCache.contactForm.addEventListener('submit', e => {
      e.preventDefault();
      
      if (validateForm(domCache.contactForm)) {
        // Simulación de envío con feedback visual mejorado
        const submitBtn = domCache.contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        
        // Simular envío AJAX
        setTimeout(() => {
          domCache.contactForm.reset();
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          showNotification('Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.');
        }, 1500);
      }
    });

    // Validación en tiempo real para campos de email
    domCache.contactForm.querySelectorAll('input[type="email"]').forEach(input => {
      input.addEventListener('blur', () => validateForm(domCache.contactForm));
    });
  };

  // Carrusel de testimonios mejorado con controles
  const initTestimonials = () => {
    if (!domCache.testimonials || domCache.testimonials.length <= 1) return;

    let currentIndex = 0;
    const testimonialCount = domCache.testimonials.length;
    
    const showTestimonial = index => {
      domCache.testimonials.forEach((testimonial, i) => {
        testimonial.classList.toggle('active', i === index);
        testimonial.setAttribute('aria-hidden', i !== index);
      });
    };

    const nextTestimonial = () => {
      currentIndex = (currentIndex + 1) % testimonialCount;
      showTestimonial(currentIndex);
    };

    // Controles de navegación
    const createControls = () => {
      const controlsContainer = document.createElement('div');
      controlsContainer.className = 'testimonial-controls';
      
      const prevBtn = document.createElement('button');
      prevBtn.className = 'testimonial-prev';
      prevBtn.innerHTML = '&lt;';
      prevBtn.setAttribute('aria-label', 'Testimonio anterior');
      
      const nextBtn = document.createElement('button');
      nextBtn.className = 'testimonial-next';
      nextBtn.innerHTML = '&gt;';
      nextBtn.setAttribute('aria-label', 'Siguiente testimonio');
      
      prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + testimonialCount) % testimonialCount;
        showTestimonial(currentIndex);
        resetInterval();
      });
      
      nextBtn.addEventListener('click', () => {
        nextTestimonial();
        resetInterval();
      });
      
      controlsContainer.appendChild(prevBtn);
      controlsContainer.appendChild(nextBtn);
      
      domCache.testimonials[0].parentNode.appendChild(controlsContainer);
    };

    let intervalId;
    const startInterval = () => {
      intervalId = setInterval(nextTestimonial, config.testimonialInterval);
    };
    
    const resetInterval = () => {
      clearInterval(intervalId);
      startInterval();
    };

    // Inicializar
    showTestimonial(0);
    createControls();
    startInterval();

    // Pausar carrusel cuando el usuario interactúa (mejor UX)
    const testimonialContainer = domCache.testimonials[0].parentNode;
    testimonialContainer.addEventListener('mouseenter', () => clearInterval(intervalId));
    testimonialContainer.addEventListener('mouseleave', startInterval);
  };

  // Animaciones al hacer scroll con Intersection Observer (más eficiente)
  const initScrollAnimations = () => {
    const animateElements = document.querySelectorAll('.fade-in, .slide-in, .zoom-in');
    if (!animateElements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    });

    animateElements.forEach(element => {
      observer.observe(element);
    });
  };

  // Notificación flotante mejorada
  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    notification.innerHTML = `
      <p>${message}</p>
      <button class="notification-close" aria-label="Cerrar notificación">&times;</button>
    `;

    document.body.appendChild(notification);

    // Animación de entrada
    setTimeout(() => notification.classList.add('visible'), 10);

    // Cierre manual
    notification.querySelector('.notification-close').addEventListener('click', () => {
      closeNotification(notification);
    });

    // Cierre automático
    const autoClose = setTimeout(() => closeNotification(notification), config.notificationDuration);

    // Pausar cierre automático al hacer hover
    notification.addEventListener('mouseenter', () => clearTimeout(autoClose));
    notification.addEventListener('mouseleave', () => {
      setTimeout(() => closeNotification(notification), config.notificationDuration);
    });
  };

  const closeNotification = (notification) => {
    notification.classList.remove('visible');
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  };

  // Botón de volver arriba mejorado
  const initScrollTopButton = () => {
    if (!domCache.scrollTopBtn) return;

    const updateScrollTopButton = () => {
      const isVisible = window.scrollY > 300;
      domCache.scrollTopBtn.style.display = isVisible ? 'block' : 'none';
      domCache.scrollTopBtn.setAttribute('aria-hidden', !isVisible);
    };

    domCache.scrollTopBtn.setAttribute('aria-label', 'Volver arriba');
    domCache.scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      domCache.scrollTopBtn.blur(); // Mejorar accesibilidad
    });

    window.addEventListener('scroll', utils.throttle(updateScrollTopButton, 200));
    updateScrollTopButton();
  };

  // Precarga de imágenes para mejor performance
  const preloadImages = () => {
    const images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  };

  // Inicializar todos los módulos
  const init = () => {
    initSmoothScroll();
    initMobileMenu();
    initFormValidation();
    initTestimonials();
    initScrollAnimations();
    initScrollTopButton();
    preloadImages();
    
    window.addEventListener('scroll', handleNavbarScroll);
    handleNavbarScroll(); // Ejecutar al cargar
  };

  init();
});