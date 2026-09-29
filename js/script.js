$(function () {

  /* ==========================================================
     0) Соглашения по разметке
        - JS цепляется за id, data-атрибуты и классы с префиксом js-,
          а не за классы оформления (БЭМ) — стили можно менять свободно;
        - состояния показываются БЭМ-модификаторами (nav--open,
          modal--open, form__field--invalid ...), стили — в scss/.
        - Брейкпоинты ниже должны совпадать с $breakpoints
          в scss/utils/_variables.scss (tablet: 768px, desktop: 1024px).
     ========================================================== */
  const mqTablet = window.matchMedia('(min-width: 768px)');
  const mqDesktop = window.matchMedia('(min-width: 1024px)');

  /* ==========================================================
     1) Выпадающее меню (мобильное)
     ========================================================== */
  const $nav = $('#nav');
  const $navToggle = $('#navToggle');

  function closeMobileNav() {
    $nav.slideUp(200).removeClass('nav--open');
    $navToggle.removeClass('nav-toggle--open');
  }

  $navToggle.on('click', function () {
    $nav.slideToggle(200).toggleClass('nav--open');
    $(this).toggleClass('nav-toggle--open');
  });

  // закрываем меню после клика по пункту (на мобильных)
  $('.js-nav-link').on('click', function () {
    if (!mqTablet.matches) closeMobileNav();
  });

  /* ==========================================================
     2) Модальное окно
     ========================================================== */
  // display управляется классом modal--open (flex-центрирование в CSS),
  // jQuery отвечает только за плавность через opacity.
  function openModal() {
    $('#modalOverlay').addClass('modal--open').hide().fadeIn(200);
  }
  function closeModal() {
    $('#modalOverlay').fadeOut(200, function () {
      $(this).removeClass('modal--open').css('display', '');
    });
  }

  $('#openModalBtn').on('click', openModal);
  $('#modalClose').on('click', closeModal);

  // закрытие по клику на оверлей (вне окна)
  $('#modalOverlay').on('click', function (e) {
    if (e.target === this) closeModal();
  });

  // закрытие по Esc
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  /* ==========================================================
     3) Динамическая галерея из JSON ($.getJSON)
     ========================================================== */
  $.getJSON('data/portfolio.json')
    .done(function (items) {
      const $grid = $('#portfolioGrid');
      $('#portfolioLoading').remove();

      items.forEach(function (item, i) {
        const tags = item.tags
          .map(function (t) { return '<span class="card__tag">' + t + '</span>'; })
          .join('');

        const $card = $(
          '<article class="card">' +
            '<img class="card__image" src="' + item.image + '" alt="' + item.title + '" loading="lazy">' +
            '<div class="card__body">' +
              '<h3 class="card__title">' + item.title + '</h3>' +
              '<p class="card__text">' + item.description + '</p>' +
              '<div class="card__tags">' + tags + '</div>' +
            '</div>' +
          '</article>'
        );

        $grid.append($card);
        // плавное появление карточек друг за другом
        $card.delay(i * 120).fadeIn(400);
      });
    })
    .fail(function () {
      $('#portfolioLoading').text('Не удалось загрузить портфолио 😕');
    });

  /* ==========================================================
     4) Формы: валидация + симуляция отправки через $.ajax()
     ========================================================== */
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function showFieldError($field, $error, message) {
    $field.closest('.js-form-field').addClass('form__field--invalid');
    $error.text(message);
  }
  function clearFieldError($field, $error) {
    $field.closest('.js-form-field').removeClass('form__field--invalid');
    $error.text('');
  }

  const STATUS_CLASSES = 'form__status--success form__status--error';

  function simulateAjaxSubmit(data) {
    // имитация запроса на сервер через $.ajax
    return $.ajax({
      url: 'https://jsonplaceholder.typicode.com/posts', // тестовый endpoint для симуляции
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data)
    });
  }

  // --- Форма обратной связи (секция Контакты) ---
  $('#contactForm').on('submit', function (e) {
    e.preventDefault();

    const $name = $('#name');
    const $email = $('#email');
    const $message = $('#message');
    let valid = true;

    if ($name.val().trim().length < 2) {
      showFieldError($name, $('#nameError'), 'Введите имя (минимум 2 символа)');
      valid = false;
    } else {
      clearFieldError($name, $('#nameError'));
    }

    if (!isValidEmail($email.val().trim())) {
      showFieldError($email, $('#emailError'), 'Введите корректный email');
      valid = false;
    } else {
      clearFieldError($email, $('#emailError'));
    }

    if ($message.val().trim().length < 5) {
      showFieldError($message, $('#messageError'), 'Сообщение слишком короткое');
      valid = false;
    } else {
      clearFieldError($message, $('#messageError'));
    }

    if (!valid) return;

    const $status = $('#formStatus');
    const $btn = $(this).find('button[type="submit"]');

    $btn.prop('disabled', true).text('Отправка...');
    $status.removeClass(STATUS_CLASSES).text('');

    simulateAjaxSubmit({
      name: $name.val().trim(),
      email: $email.val().trim(),
      message: $message.val().trim()
    })
      .done(function () {
        $status.addClass('form__status--success').text('Сообщение отправлено! Спасибо ✅');
        $('#contactForm')[0].reset();
      })
      .fail(function () {
        $status.addClass('form__status--error').text('Не удалось отправить, попробуйте позже ❌');
      })
      .always(function () {
        $btn.prop('disabled', false).text('Отправить');
      });
  });

  // --- Форма в модальном окне ---
  $('#modalForm').on('submit', function (e) {
    e.preventDefault();

    const $email = $('#modalEmail');
    const $status = $('#modalStatus');

    if (!isValidEmail($email.val().trim())) {
      showFieldError($email, $('#modalEmailError'), 'Введите корректный email');
      return;
    }
    clearFieldError($email, $('#modalEmailError'));

    const $btn = $(this).find('button[type="submit"]');
    $btn.prop('disabled', true).text('Отправка...');
    $status.removeClass(STATUS_CLASSES).text('');

    simulateAjaxSubmit({ email: $email.val().trim() })
      .done(function () {
        $status.addClass('form__status--success').text('Заявка принята! Скоро свяжусь ✅');
        $('#modalForm')[0].reset();
        setTimeout(closeModal, 1200);
      })
      .fail(function () {
        $status.addClass('form__status--error').text('Ошибка отправки, попробуйте снова ❌');
      })
      .always(function () {
        $btn.prop('disabled', false).text('Отправить заявку');
      });
  });

  /* ==========================================================
     5) Карусель навыков (кнопки + автопрокрутка)
     ========================================================== */
  const $track = $('#skillsTrack');
  const $slides = $track.children('.js-carousel-slide');
  const $dotsWrap = $('#skillsDots');

  function slidesPerView() {
    if (mqDesktop.matches) return 3;
    if (mqTablet.matches) return 2;
    return 1;
  }

  let current = 0;
  let perView = slidesPerView();
  let maxIndex = Math.max(0, $slides.length - perView);
  let autoplayTimer = null;

  function buildDots() {
    $dotsWrap.empty();
    for (let i = 0; i <= maxIndex; i++) {
      $('<span class="carousel__dot js-carousel-dot"></span>')
        .toggleClass('carousel__dot--active', i === current)
        .attr('data-index', i)
        .appendTo($dotsWrap);
    }
  }

  function updateCarousel() {
    const slideWidth = 100 / perView;
    $track.css('transform', 'translateX(-' + (current * slideWidth) + '%)');
    $dotsWrap.children('.js-carousel-dot').each(function (i) {
      $(this).toggleClass('carousel__dot--active', i === current);
    });
  }

  function goTo(index) {
    if (index < 0) index = maxIndex;
    if (index > maxIndex) index = 0;
    current = index;
    updateCarousel();
  }

  function nextSlide() { goTo(current + 1); }
  function prevSlide() { goTo(current - 1); }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, 3500);
  }
  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  $('#skillsNext').on('click', function () { nextSlide(); startAutoplay(); });
  $('#skillsPrev').on('click', function () { prevSlide(); startAutoplay(); });

  $dotsWrap.on('click', '.js-carousel-dot', function () {
    goTo(parseInt($(this).attr('data-index'), 10));
    startAutoplay();
  });

  $('#skillsCarousel').on('mouseenter', stopAutoplay).on('mouseleave', startAutoplay);

  buildDots();
  updateCarousel();
  startAutoplay();

  $(window).on('resize', function () {
    // на широком экране меню всегда видно: сбрасываем inline-стили slideToggle
    if (mqTablet.matches) {
      $nav.removeAttr('style').removeClass('nav--open');
      $navToggle.removeClass('nav-toggle--open');
    }

    perView = slidesPerView();
    maxIndex = Math.max(0, $slides.length - perView);
    if (current > maxIndex) current = maxIndex;
    buildDots();
    updateCarousel();
  });

  /* ==========================================================
     6) Подсветка активного пункта меню при скролле
     ========================================================== */
  const $sections = $('section[id]');
  const $navLinks = $('.js-nav-link');

  function highlightNav() {
    const scrollPos = $(window).scrollTop() + 90;
    let currentId = null;

    $sections.each(function () {
      const top = $(this).offset().top;
      const bottom = top + $(this).outerHeight();
      if (scrollPos >= top && scrollPos < bottom) {
        currentId = $(this).attr('id');
      }
    });

    $navLinks.removeClass('nav__link--active');
    if (currentId) {
      $navLinks.filter('[href="#' + currentId + '"]').addClass('nav__link--active');
    }
  }

  /* ==========================================================
     7) Кнопка "Вверх" + плавный скролл
     ========================================================== */
  const $backToTop = $('#backToTop');

  $(window).on('scroll', function () {
    highlightNav();
    if ($(window).scrollTop() > 400) {
      $backToTop.addClass('back-to-top--visible');
    } else {
      $backToTop.removeClass('back-to-top--visible');
    }
  });

  $backToTop.on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 500);
  });

  // плавный скролл ко всем якорным ссылкам
  $('a[href^="#"]').on('click', function (e) {
    const target = $(this.hash);
    if (target.length) {
      e.preventDefault();
      $('html, body').animate({ scrollTop: target.offset().top - 64 }, 500);
    }
  });

  highlightNav();

  /* ==========================================================
     8) Светлая / тёмная тема
        Палитры описаны Sass-картами (scss/utils/_variables.scss),
        из них сгенерированы CSS-переменные для :root и
        [data-theme='dark']. Здесь мы только переключаем атрибут
        data-theme на <html> и запоминаем выбор в localStorage.
        Начальная тема ставится в js/theme-init.js (в <head>).
     ========================================================== */
  const THEME_KEY = 'theme'; // должен совпадать с ключом в js/theme-init.js
  const $html = $(document.documentElement);
  const $themeToggle = $('.js-theme-toggle');
  const $themeIcon = $('.js-theme-icon');

  function applyTheme(theme) {
    $html.attr('data-theme', theme);
    $themeToggle.attr('aria-pressed', theme === 'dark' ? 'true' : 'false');
    // иконка показывает, на какую тему переключимся по клику
    $themeIcon.text(theme === 'dark' ? '☀️' : '🌙');
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      // localStorage недоступен — тема просто не запомнится
    }
  }

  $themeToggle.on('click', function () {
    const next = $html.attr('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
  });

  // синхронизируем кнопку с темой, выставленной в theme-init.js
  applyTheme($html.attr('data-theme') === 'dark' ? 'dark' : 'light');
});
