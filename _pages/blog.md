---
title: Blog Posts
description: "The list of all of my blog posts."
og-type: website
permalink: /blog
nav: none
---

{% for post in site.posts %}
{% if post.categories contains "blog" %}
{% include blog-listing.html %}
{% endif %}
{% endfor %}

 