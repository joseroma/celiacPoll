/* PROPIETARY */
$(document).on('click', "#btn-anadir", function() {
$('#fh5co-content').html('<form action="#" method="post">\
					<div class="col-md-12"> \
						<div class="form-group"> \
							<label for="enunciado" class="sr-only">Enunciado</label> \
							<textarea placeholder="Enunciado" id="Enunciado" type="text" class="form-control input-lg" rows="3"></textarea \
						</div>	\
					</div>\
					<div id="fo">\
					<div class="col-md-12"> \
						<div class="form-group">\
							<label for="Opcion1" class="sr-only">Opcion1</label>\
							<input placeholder="Opcion1" id="opcion1" type="text" class="form-control input-lg">\
						</div>	\
					</div>\
					\
					<div class="col-md-12"> \
						<div class="form-group">\
							<label for="Opcion2" class="sr-only">Opcion2</label>\
							<input placeholder="Opcion2" id="opcion2" type="text" class="form-control input-lg">\
						</div>	\
					</div>\
					</div>\
					<div class="col-md-12">\
						<div class="form-group">\
							<input type="submit" class="btn btn-primary btn-lg " value="Añadir">\
						</div>	\
					</div>\
				</form>\
				<div class="col-md-12"> \
							<a class="btn btn-outline btn-sm" id="anadir-opcion" onClick="aa=crearOpcion(aa)">+</a>\
					</div>	')
});

var aa=2;
function crearOpcion(aa) {
aa= aa+1;
	$('#fo').append('<div class="col-md-12"> \
						<div class="form-group">\
							<label for="Opcion'+aa+'" class="sr-only">Opcion'+aa+'</label>\
							<input placeholder="Opcion'+aa+'" id="opcion'+aa+'" type="text" class="form-control input-lg">\
						</div>	\
					</div> ')
return aa
};