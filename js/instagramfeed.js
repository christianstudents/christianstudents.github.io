(function instagramFeed(user, numPosts, forEachPost, done, failed) {
	new Promise(function(accept, reject) {
		let xhr = new XMLHttpRequest();
		xhr.open("GET","https://instagram.com/" + user);
		xhr.addEventListener("readystatechange", function() {
			if (this.readyState == 4) {
				if (this.status == 200) {
					accept(this);
	            } else {
					reject(this);
	            }
	        }
		});
		xhr.send();
	}).then(function(xhr) {
		try {
			let data = JSON.parse(xhr.responseText.match(/<script[^>]*?>.*?_sharedData\s*=\s*(\{.*\}).*?<\/script>/)[1]);
			let edges = data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;
			let posts = edges.map(edge => edge.node.shortcode);
			numPosts = Math.min(numPosts, posts.length);

			for (let i = 0;i < numPosts; i++) {
				try {
					forEachPost(
						i,
						edges[i].node.shortcode,
						edges[i].node.accessibility_caption,
						edges[i].node.dimensions,
						edges[i].node.edge_media_to_caption.edges[0].node.text,
						edges[i].node.edge_liked_by.count,
						edges[i].node.edge_media_to_comment.count,
						new Date(edges[i].node.taken_at_timestamp * 1000),
						edges[i]
					)
				} catch (err) {
					failed(err, 3, {HTTP: 1, PROCESSING_ERROR: 2, CALLBACK_ERROR: 3});
				}
			}

			done();

			return;
		} catch (err) {
			failed(err, 2, {HTTP: 1, PROCESSING_ERROR: 2, CALLBACK_ERROR: 3});
		}
	}).catch(function(xhr) {
		failed(err, 1, {HTTP: 1, PROCESSING_ERROR: 2, CALLBACK_ERROR: 3});
	});
})("stanfordchristianstudents", 6, function forEachPost(index, shortcode, altText, dimensions, caption, likes, comments, timestamp, data) {
	let post = document.querySelector("[data-ig-post-index=\"" + index + "\"]");
	let img = post.querySelector("img");
	img.src = "https://instagram.com/p/" + shortcode + "/media?size=l";
	img.alt = altText;
	post.querySelector(".link-orig-post").href = "https://instagram.com/p/" + shortcode;
	post.querySelector(".interactions .likes").innerText = likes;
	post.querySelector(".interactions .comments").innerText = comments;
	post.querySelector(".date span").innerText = 
		["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][timestamp.getDay()] + " " +
		["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][timestamp.getMonth()] + " " +
		"00".substr(timestamp.getDate().toString().length) + timestamp.getDate().toString() + ", " +
		timestamp.getFullYear();

	if (caption.length > 120) {
		post.querySelector(".caption .preview").innerText = caption.substr(0, 100).replace(/\s*$/, "") + "\u2026 ";
		post.querySelector(".caption .more").addEventListener("click", function() {
			this.previousElementSibling.innerText = caption;
			this.classList.add("hidden");
		});
	} else {
		post.querySelector(".caption .preview").innerText = caption;
		post.querySelector(".caption .more").classList.add("hidden");
	}
}, function done() {
	document.getElementById("recent-posts").classList.replace("processing", "succeeded");
}, function failed(err, reason, reasons) {
	document.getElementById("recent-posts").classList.replace("processing", "failed");
});