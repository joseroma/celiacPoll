import React, { Component } from 'react';

class MainIndex extends Component {
  render() {
    return (
      <div id="parent">
        <header id="fh5co-header-section" className="" >
          <div className="container">
            <h1 id="fh5co-logo" className="pull-left"><a href="/"><img src="images/logo.png" alt="CeliacPoll"></img></a></h1>
            <nav id="fh5co-menu-wrap">
              <ul className="sf-menu" id="fh5co-primary-menu">
                <li className="active"><a href="/">Home</a></li>
                <li>
                  <a href="" className="fh5co-sub-ddown">Cuestionarios</a>
                  <ul className="fh5co-sub-menu">
                    <li><a href="/cuestionario1">Soy celíaco</a></li>
                    <li><a href="/cuestionario2">Quiero saber si soy celíaco</a></li>
                  </ul>
                </li>
                <li><a href="/contact">Contact</a></li>
                <li><a href="/admin">Admin</a></li>
                <li><a href="/login">Log In</a></li>
              </ul>
            </nav>
          </div>
        </header>

        <div id="fh5co-hero" styles="background-image: url(images/slide_2.jpg);">
          <div className="overlay"></div>
          <a href="#fh5co-main" className="smoothscroll fh5co-arrow to-animate hero-animate-4"><i className="ti-angle-down"></i></a>
          <div className="container">
            <div className="col-md-12">
              <div className="fh5co-hero-wrap">
                <div className="fh5co-hero-intro">
                  <h1 className="to-animate hero-animate-1">CeliacPoll, ¿Sospechas que eres celíaco?<br /> Haz nuestro cuestionario.</h1>
                  <h2 className="to-animate hero-animate-2">Creado por bioinformáticos de la uma</h2>
                  <p className="to-animate hero-animate-3"><a href="signup.html" className="btn btn-outline btn-md">Sign up</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="fh5co-main">
          <div className="fh5co-cards">
            <div className="container-fluid">
              <div className="row animate-box">
                <div className="col-md-12 heading text-center">
                  <h2>Nuestros servicios</h2>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-3 col-md-6 col-sm-6 animate-box">
                  <a className="fh5co-card" href="cuestionario2.html">
                    <img src="images/img_large_1.jpg"  className="img-responsive"></img>
                    <div className="fh5co-card-body">
                      <h3>Cuestionario de diagnóstico </h3>
                      <p>¿Sospechas que eres celíaco y quieres una opinión antes de acudir a un especialista? Haz nuestro formulario.</p>
                    </div>
                  </a>
                </div>
                <div className="col-lg-3 col-md-6 col-sm-6 animate-box">
                  <a className="fh5co-card" href="cuestionario1.html">
                    <img src="images/img_large_2.jpg" className="img-responsive"></img>
                    <div className="fh5co-card-body">
                      <h3>Soy celíaco y quiero ayudar al proyecto</h3>
                      <p>¿Eres celíaco diagnosticado y quieres ayudar al proyecto aportando tu experiencia personal? Es totalmente anónimo.</p>
                    </div>
                  </a>
                </div>
                <div className="col-lg-3 col-md-6 col-sm-6 animate-box">
                  <a className="fh5co-card" href="contact.html">
                    <img src="images/img_large_2.jpg"  className="img-responsive"></img>
                    <div className="fh5co-card-body">
                      <h3>Contacta con un Especialista</h3>
                      <p>Aquí puedes ponerte en contacto con un doctor especializado.</p>
                    </div>
                  </a>
                </div>
                <div className="col-lg-3 col-md-6 col-sm-6 animate-box">
                  <a className="fh5co-card" href="signup.html">
                    <img src="images/img_large_3.jpg"  className="img-responsive"></img>
                    <div className="fh5co-card-body">
                      <h3>Registrate</h3>
                      <p>Registrate aquí si aún no lo has hecho</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div id="fh5co-testimonial">
            <div className="container">
              <div className="row">
                <h2 className="fh5co-uppercase-heading-sm text-center animate-box">Citas célebres...</h2>
                <div className="fh5co-spacer fh5co-spacer-xs"></div>
                <div className="owl-carousel-fullwidth animate-box">
                  <div className="item">
                    <p className="text-center quote">&ldquo;Aspiro a ser humano cuando estoy delante de un paciente y reconozco que soy bastante médico en mi vida corriente. &rdquo; <cite className="author">&mdash; Dr. Carlos de Sola</cite></p>
                  </div>
                  <div className="item">
                    <p className="text-center quote">&ldquo;Es necesario un actualización permanente y la incorporación de las novedades que aparecen cada día. &rdquo;<cite className="author">&mdash; </cite></p>
                  </div>
                  <div className="item">
                    <p className="text-center quote">&ldquo;Las manipulaciones de la flora intestinal humana plantean un apasionante debate y abren la puerta a la solución ó tal vez creación de enfermedades. &rdquo;<cite className="author">&mdash;</cite></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <footer role="contentinfo" id="fh5co-footer">
          <a href="#" className="fh5co-arrow fh5co-gotop footer-box"><i className="ti-angle-up"></i></a>
          <div className="container">
            <div className="row">
              <div className="col-md-4 col-sm-6 footer-box">
                <h3 className="fh5co-footer-heading">Company</h3>
                <ul className="fh5co-footer-links">
                  <li><a href="#">About</a></li>
                  <li><a href="#">Services</a></li>
                  <li><a href="#">Our Products</a></li>
                  <li><a href="#">Our Culture</a></li>
                  <li><a href="#">Team</a></li>
                </ul>
              </div>
              <div className="col-md-4 col-sm-6 footer-box">
                <h3 className="fh5co-footer-heading">More Links</h3>
                <ul className="fh5co-footer-links">
                  <li><a href="#">Terms &amp; Conditions</a></li>
                  <li><a href="#">Our Careers</a></li>
                  <li><a href="#">Support &amp; FAQ's</a></li>
                  <li><a href="signup.html">Sign up</a></li>
                  <li><a href="login.html">Log in</a></li>
                </ul>
              </div>
              <div className="col-md-4 col-sm-12 footer-box">
                <h3 className="fh5co-footer-heading">Get in touch</h3>
                <ul className="fh5co-social-icons">
                  <li><a href="www.lahoradeladigestion.com"><i className="ti-google"></i></a></li>
                  <li><a href="#"><i className="ti-twitter-alt"></i></a></li>
                  <li><a href="#"><i className="ti-facebook"></i></a></li>
                  <li><a href="#"><i className="ti-instagram"></i></a></li>
                  <li><a href="#"><i className="ti-dribbble"></i></a></li>
                </ul>
              </div>
              <div className="col-md-12 footer-box text-center">
                <div className="fh5co-copyright">
                  <p>
                    &copy; "Dr. Carlos de sola". All Rights Reserved. <br/>
                    Designed by <a href="#" target="_blank">Bioinformaticos de la UMA</a>
                    Images by: <a href="http:%5C%5C%0Aunsplash.com" target="_blank">Unsplash</a>
                  </p>
                </div>
              </div>
            </div>
            <div className="fh5co-spacer fh5co-spacer-md"></div>
          </div>
        </footer>
      </div>
    );
  }
}

export default MainIndex;