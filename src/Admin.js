import React, { Component } from 'react';

class Admin extends Component {
  render() {
  		return (
	      	<div id="parent">
		      	<header id="fh5co-header-section" role="header" className="">
		      		<div className="container">
		              <h1 id="fh5co-logo" className="pull-left"><a href="/"><img src="images/logo.png" alt="CeliacPoll"></img></a></h1>
		              	<nav id="fh5co-menu-wrap">
				            <ul className="sf-menu" id="fh5co-primary-menu">
					            <li><a href="/">Home</a></li>
					            <li>
					                <a href="" className="fh5co-sub-ddown">Cuestionarios</a>
					                 <ul className="fh5co-sub-menu">
					                  <li><a href="/cuestionario1">Soy celíaco</a></li>
					                  <li><a href="/cuestionario2">Quiero saber si soy celíaco</a></li>
					                </ul>
					            </li>
					            <li><a href="/contact">Contact</a></li>
					            <li className="active"><a href="/admin">Admin</a></li>
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
									<h1 className="to-animate hero-animate-1">Administrador</h1>
									<h2 className="to-animate hero-animate-2">Administra los datos desde aquí</h2>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div id="fh5co-main">
					<div className="container">
						<div className="row">
							<div className="col-md-8 col-md-push-4" id="fh5co-content">
								<div className="content-box animate-box">
									<h2>Administrador</h2>
									<p>A la izquierda están las acciones que se le permite realizar</p>
								</div>
							</div>
							<div className="col-md-4 col-md-pull-8 left-sidebar" id="fh5co-sidebar">
								<div className="sidebar-box animate-box">
									<h3 className="sidebar-heading"><span className="border"></span>Acciones</h3>
									<ul className="sidebar-links">
										<li><button className="btn btn-outline btn-sm" id="btn-anadir">Añadir pregunta</button></li>
										<li><button className="btn btn-outline btn-sm" id="btn-mod">Modificar Pregunta</button></li>
										<li><button className="btn btn-outline btn-sm" id="btn-ver">Ver Cuestionarios</button></li>
										<li><button className="btn btn-outline btn-sm" id="btn-grafics">Gráficas</button></li>
									</ul>
								</div>
								<div className="sidebar-box animate-box">
									<h3 className="sidebar-heading"><span className="border"></span>Cerrar Sesión</h3>
									<p><a href="#" className="btn btn-outline btn-sm">Cerrar Sesión</a></p>
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
									<p>&copy; "Dr. Carlos de Sola". All Rights Reserved. <br/>Designed by <a href="#" target="_blank">Bioinformaticos de la UMA</a> Images by: <a href="http://unsplash.com" target="_blank">Unsplash</a></p>
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

export default Admin;