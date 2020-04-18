addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

class ElementHandler {

  element(element) {

	// Add my name to the variant's title
	if (element.tagName == 'title') {
	   element.prepend("Maya's ");
	}
	// Add my name to the main title of the page
	else if (element.tagName == 'h1' && element.getAttribute('id') == 'title') {
	   element.prepend("Welcome to Maya's ");
	   element.append("!");
	}
	// Add some customized text (and an image) to the page
	else if (element.tagName == 'p' && element.getAttribute('id') == 'description') {
	   let greeting = "Nice to meet you! My name is Maya Nigrin. Click on the link below to learn more about me!<br/><br/>This variant will persist as long as this session is active. Try again after your session has ended to potentially get a different variant!";
	   element.setInnerContent(greeting, { html: true });
	   let avatar = '<br><img src="https://i.ibb.co/X5KgPwc/myAvatar.png" style="display: block; margin-left: auto; margin-right: auto;" onerror="this.style.display=\'none\'">';
	   element.after(avatar, { html: true });
	}
	// Change link text and url
	else if (element.tagName == 'a' && element.getAttribute('id') == 'url') {
	   element.setInnerContent("Learn more about Maya");
	   element.setAttribute('href', 'http://mayanigrin.com/');
	}
  }

}

/**
 * Takes in string of browser cookies and returns cookie value for 'variant_url', 
 * or null if none such value exists
 *
 * @param {String} cookie_str
 */
function parseCookie(cookie_str){
	var cookie_map = cookie_str
		.split(';')
		.map(splt => splt.split('='))
		.reduce((cmap, pair) => {
			let key = decodeURIComponent(pair[0].trim());
			let val = decodeURIComponent(pair[1].trim());
			cmap[key] = val;
			return cmap;
		}, {});

	if ('variant_url' in cookie_map) {
		return cookie_map['variant_url'];
	} else {
		return null;
	}
}


/**
 * Fetches array of variants, and then randomly displays a variant 
 * with equal probability of each
 *
 * @param {Request} request
 */
async function handleRequest(request) {

	// Get cookies from request header
	var cookie = request.headers.get('cookie');
	
	// Get previously-visited url if it exists in cookies
	var cookie_url = null;
	if (cookie != null) {
		cookie_url = parseCookie(cookie);
	}

	// If previously-visited url exists, use it
	if (cookie_url != null) {
	    console.log("found cookie");
	    var url = parseCookie(cookie);

	    // Fetch HTML from variant url, and return it with customizations
            return fetch(cookie_url).then(res => {
                let modified = new HTMLRewriter().on('*', new ElementHandler()).transform(res);
                return new Response(modified.body, {
                        credentials: 'include',
                        headers: {'Set-Cookie': 'variant_url='+url}
                });
            });
	}

	// If not, fetch variant urls and randomly select one 
	else {

	  console.log("new session");
	  return fetch('https://cfw-takehome.developers.workers.dev/api/variants')
          .then(response => {
                return response.json();
          })
	  .then(data => {

	  	// Get array of variants
	  	let variants = data['variants'];

          	// Select random index from array
          	let random_index = Math.floor(Math.random() * variants.length);

          	// Select random variant url from array
          	let random_variant = variants[random_index];

          	return random_variant;
       	  })
	  .then(url => {

		console.log(url);
		
		// Fetch HTML from variant url, and return it with customizations
		return fetch(url).then(res => {
			let modified = new HTMLRewriter().on('*', new ElementHandler()).transform(res);
			return new Response(modified.body, {
				credentials: 'include',
				headers: {'Set-Cookie': 'variant_url='+url}
			});
		});
	  });
	}
}
