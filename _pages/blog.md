---
title: Blog Posts
description: "The list of all of my blog posts."
og-type: website
permalink: /blog
nav: none
---

{% for post in site.posts %}
{% unless post.categories contains "unlisted" or post.categories contains "now" %}
{% include blog-listing.html %}
{% endunless %}
{% endfor %}

 