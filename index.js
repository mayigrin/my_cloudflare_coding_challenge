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
	   element.setInnerContent("Nice to meet you! My name is Maya Nigrin. Click on the link below to learn more about me!");
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
 * Fetches array of variants, and then randomly displays a variant 
 * with equal probability of each
 *
 * @param {Request} request
 */
async function handleRequest(request) {
	
	// Get array of variants
	return fetch('https://cfw-takehome.developers.workers.dev/api/variants')
	  .then(response => { 
		  return response.json();
	  })
	  .then(data => {
		let variants = data['variants'];

		// Select random index from array
		let random_index = Math.floor(Math.random() * variants.length);
		
		// Select random variant url from array
		let random_variant = variants[random_index];
		
		return random_variant;
	  })
	  .then(url => {
		
		// Fetch HTML from variant url, and return it with customizations
		return fetch(url).then(res => {
			return new HTMLRewriter().on('*', new ElementHandler()).transform(res);
		})  
	  })
	  .catch(error => {
	  	console.log(error);
	  });
}
