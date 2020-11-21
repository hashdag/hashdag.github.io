---
title: How to Create a Random Post Link in Jekyll
description: How to link to a random post using Jekyll or any other static blog using a bit of client-side JavaScript
syntax: true
category: tech-guide
tags: jekyll
permalink: /blog/Getting-Random-Post-in-Jekyll
---

There's something fun about random post buttons, and adding one to my blog became a coding challenge. If you'd like to just copy and paste the code for your own Jekyll blog, skip the backstory and [go to the code](#code).

## The Solution

Here's what I wanted:

- A link to a random blog post
- To exclude the current page from possible destinations

The concept is straightforward: add the URL of each post to an array, exclude the post that the user clicked the random link on, generate a random number between zero and the number of posts and then `[array][randomNumber]` gives you the link to a random post.

Creating the array with a mix of [Liquid][liq] and JavaScript was easy enough.

The technical limitations of a Jekyll blog mean that client-side JavaScript is the only way generate a random number. Still easy enough.

This could easily get cumbersome if I did this on each page. Why slow down load times when most readers are never going to notice my random post link anyway? The most logical work around was to create a new page to build the array and generate the random number on and then automatically redirect the reader to the random post. I later figured out this is how [Wikipedia][fet] and [Reddit][red] operate their random links, albeit server side.  

The real trick was excluding the current page from the array. I decided to create the array statically each time the site is built. Removing the current page from the array proved buggy. So I added a ```do while``` loop to generate another random number if the first one matched the current post. In theory, this could lead to an infinite loop; in practice, you're looking at something like a one in a million shot at looping through more than five times. Just in case, I put a break after 10 iterations.  

<h2 id="code">The Code</h2>

Copy this code into the ```<head>``` section of your random redirect page and reset the manual links in case someone hits the one in a million chance of needing them:

{% highlight JavaScript %}
<script>
var comingFromPost = document.referrer;

function linkToRandomBlogPost() {
	var allPosts = [{%raw%}{% for post in site.posts %}{%endraw%}
      "{%raw%}{{ post.url }}{%endraw%}"{%raw%}{% unless post.previous == nil %}{%endraw%},{%raw%}{% endunless %}{%endraw%}
	}
    {%raw%}{% endfor %}{%endraw%}];

var i = 0;
do {
	var randomPostLink = allPosts[Math.floor(Math.random() * allPosts.length)]; i++;}
while (comingFromPost.includes(randomPostLink) || i > 10)

if (i > 10 && comingFromPost !== '/blog/Getting-Random-Post-in-Jekyll') {
	randomPostLink = '/blog/Getting-Random-Post-in-Jekyll';}

if (i > 10 && comingFromPost === '/blog/Getting-Random-Post-in-Jekyll') {
	randomPostLink = '/blog/Creating-a-Tag-Page-with-Jekyll'
	}

return randomPostLink;
}

location.replace(linkToRandomBlogPost())

</script>
{% endhighlight %}

## The Payoff

If you go to [derekkedziora.com/blog/random][random], you'll automatically be redirected to a random post on my blog.

For a more philosophical read about randomness, there's always [The Dice Man][dice]. Have some fun and get outside your bubble with randomness.

[code]: /blog-Getting-Random-Post-in-Jekyll#code
[dice]: https://en.wikipedia.org/wiki/The_Dice_Man
[liq]: https://shopify.github.io/liquid/  
[random]: /blog/random
[fet]: https://en.wikipedia.org/wiki/Special:RandomInCategory/Featured_articles
[red]: http://reddit.com/r/random
