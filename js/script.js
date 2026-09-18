$(function () {

  /* ==========================================================
     1) Выпадающее меню (мобильное)
     ========================================================== */
  $('#navToggle').on('click', function () {
    $('#nav').slideToggle(200).toggleClass('nav--open');
    $(this).toggleClass('nav-toggle--open');
  });

  // закрываем меню после клика по пункту (на мобильных)
  $('.nav__link').on('click', function () {
    if ($(window).width() <= 767) {
      $('#nav').slideUp(200).removeClass('nav--open');
    }
  });

  /* ==========================================================
     2) Модальное окно
     ========================================================== */
  function openModal() {
    $('#modalOverlay').fadeIn(200).addClass('open');
  }
  function closeModal() {
    $('#modalOverlay').fadeOut(200).removeClass('open');
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
            '<img src="' + item.image + '" alt="' + item.title + '" loading="lazy">' +
            '<div class="card__body">' +
              '<h3>' + item.title + '</h3>' +
              '<p>' + item.description + '</p>' +
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
    $field.closest('.form__field').addClass('invalid');
    $error.text(message);
  }
  function clearFieldError($field, $error) {
    $field.closest('.form__field').removeClass('invalid');
    $error.text('');
  }

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
    $status.removeClass('success error').text('');

    simulateAjaxSubmit({
      name: $name.val().trim(),
      email: $email.val().trim(),
      message: $message.val().trim()
    })
      .done(function () {
        $status.addClass('success').text('Сообщение отправлено! Спасибо ✅');
        $('#contactForm')[0].reset();
      })
      .fail(function () {
        $status.addClass('error').text('Не удалось отправить, попробуйте позже ❌');
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
    $status.removeClass('success error').text('');

    simulateAjaxSubmit({ email: $email.val().trim() })
      .done(function () {
        $status.addClass('success').text('Заявка принята! Скоро свяжусь ✅');
        $('#modalForm')[0].reset();
        setTimeout(closeModal, 1200);
      })
      .fail(function () {
        $status.addClass('error').text('Ошибка отправки, попробуйте снова ❌');
      })
      .always(function () {
        $btn.prop('disabled', false).text('Отправить заявку');
      });
  });

  /* ==========================================================
     5) Карусель навыков (кнопки + автопрокрутка)
     ========================================================== */
  const $track = $('#skillsTrack');
  const $slides = $track.children('.skill-card');
  const $dotsWrap = $('#skillsDots');

  function slidesPerView() {
    const w = $(window).width();
    if (w <= 767) return 1;
    if (w <= 1023) return 2;
    return 3;
  }

  let current = 0;
  let perView = slidesPerView();
  let maxIndex = Math.max(0, $slides.length - perView);
  let autoplayTimer = null;

  function buildDots() {
    $dotsWrap.empty();
    for (let i = 0; i <= maxIndex; i++) {
      $('<span class="carousel__dot"></span>')
        .toggleClass('active', i === current)
        .attr('data-index', i)
        .appendTo($dotsWrap);
    }
  }

  function updateCarousel() {
    const slideWidth = 100 / perView;
    $track.css('transform', 'translateX(-' + (current * slideWidth) + '%)');
    $dotsWrap.children('.carousel__dot').each(function (i) {
      $(this).toggleClass('active', i === current);
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

  $dotsWrap.on('click', '.carousel__dot', function () {
    goTo(parseInt($(this).attr('data-index'), 10));
    startAutoplay();
  });

  $('#skillsCarousel').on('mouseenter', stopAutoplay).on('mouseleave', startAutoplay);

  buildDots();
  updateCarousel();
  startAutoplay();

  $(window).on('resize', function () {
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
  const $navLinks = $('.nav__link');

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

    $navLinks.removeClass('active');
    if (currentId) {
      $navLinks.filter('[href="#' + currentId + '"]').addClass('active');
    }
  }

  /* ==========================================================
     7) Кнопка "Вверх" + плавный скролл
     ========================================================== */
  const $backToTop = $('#backToTop');

  $(window).on('scroll', function () {
    highlightNav();
    if ($(window).scrollTop() > 400) {
      $backToTop.addClass('show');
    } else {
      $backToTop.removeClass('show');
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
});
