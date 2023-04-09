;
(function ($) {
  'use strict'

  // Sticky menu
  var $window = $(window)
  $window.on('scroll', function () {
    var scroll = $window.scrollTop()
    if (scroll < 300) {
      $('.sticky').removeClass('is-sticky')
    } else {
      $('.sticky').addClass('is-sticky')
    }
  })

  // Off Canvas Open close
  $('.mobile-menu-btn').on('click', function () {
    $('body').addClass('fix')
    $('.off-canvas-wrapper').addClass('open')
  })

  $('.btn-close-off-canvas,.off-canvas-overlay').on('click', function () {
    $('body').removeClass('fix')
    $('.off-canvas-wrapper').removeClass('open')
  })

  // offcanvas mobile menu
  var $offCanvasNav = $('.mobile-menu')

  var $offCanvasNavSubMenu = $offCanvasNav.find('.dropdown')

  /* Add Toggle Button With Off Canvas Sub Menu */
  $offCanvasNavSubMenu
    .parent()
    .prepend('<span class="menu-expand"><i></i></span>')

  /* Close Off Canvas Sub Menu */
  $offCanvasNavSubMenu.slideUp()

  /* Category Sub Menu Toggle */
  $offCanvasNav.on('click', 'li a, li .menu-expand', function (e) {
    var $this = $(this)
    if (
      $this
      .parent()
      .attr('class')
      .match(/\b(menu-item-has-children|has-children|has-sub-menu)\b/) &&
      ($this.attr('href') === '#' || $this.hasClass('menu-expand'))
    ) {
      e.preventDefault()
      if ($this.siblings('ul:visible').length) {
        $this.parent('li').removeClass('active')
        $this.siblings('ul').slideUp()
      } else {
        $this.parent('li').addClass('active')
        $this
          .closest('li')
          .siblings('li')
          .removeClass('active')
          .find('li')
          .removeClass('active')
        $this
          .closest('li')
          .siblings('li')
          .find('ul:visible')
          .slideUp()
        $this.siblings('ul').slideDown()
      }
    }
  })

  // hero slider active js
  $('.hero-slider-active').slick({
    // fade: true,
    speed: 1000,
    dots: false,
    arrows: false,
    adaptiveHeight: true,
    prevArrow: '<button type="button" class="slick-prev"></button>',
    nextArrow: '<button type="button" class="slick-next"></button>',
    responsive: [{
      breakpoint: 1200,
      settings: {
        arrows: false,
        dots: false
      }
    }]
  })

  // testimonial cariusel active js
  $('.testimonial-carousel-active').slick({
    speed: 1000,
    autoplay: false,
    arrows: true,
    adaptiveHeight: true,
    prevArrow: '<button type="button" class="slick-prev"></button>',
    nextArrow: '<button type="button" class="slick-next"></button>'
  })

  // brand logo carousel active js
  $('.brand-logo-carousel').slick({
    speed: 1000,
    slidesToShow: 4,
    autoplay: true,
    arrows: false,
    adaptiveHeight: true,
    responsive: [{
        breakpoint: 992,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1
        }
      }
    ]
  })

  // Background Image JS start
  var bgSelector = $('.bg-img')
  bgSelector.each(function (index, elem) {
    var element = $(elem)

    var bgSource = element.data('bg')
    element.css('background-image', 'url(' + bgSource + ')')
  })

  // mailchimp active js
  $('#mc-form').ajaxChimp({
    language: 'en',
    callback: mailChimpResponse,
    // ADD YOUR MAILCHIMP URL BELOW HERE!
    url: 'https://devitems.us11.list-manage.com/subscribe/post?u=6bbb9b6f5827bd842d9640c82&amp;id=05d85f18ef'
  })

  // mailchimp active js
  function mailChimpResponse(resp) {
    if (resp.result === 'success') {
      $('.mailchimp-success')
        .html('' + resp.msg)
        .fadeIn(900)
      $('.mailchimp-error').fadeOut(400)
    } else if (resp.result === 'error') {
      $('.mailchimp-error')
        .html('' + resp.msg)
        .fadeIn(900)
    }
  }

  // Counter To Up JS
  $('.odometer').each(function () {
    $(this).appear(function () {
      var $this = $(this)

      var $dataValue = $this.data('count')

      setTimeout(function () {
        $this.html($dataValue)
      }, 1000)
    })
  })

  // waypoint active js
  function teamMember() {
    if ($window.width() < 575) {
      $('.team-member').waypoint(
        function () {
          $(this.element).toggleClass('team-open')
        }, {
          offset: '75%'
        }
      )
    }
  }
  teamMember()

  // Scroll to top active js
  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 600) {
      $('.scroll-top').removeClass('not-visible')
    } else {
      $('.scroll-top').addClass('not-visible')
    }
  })
  $('.scroll-top').on('click', function (event) {
    $('html,body').animate({
        scrollTop: 0
      },
      1000
    )
  })

  $window.resize(function () {
    teamMember()
  })

  // wow js active
  new WOW().init()

})(jQuery)