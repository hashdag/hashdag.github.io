---
title: Blog Posts
description: "The list of all of my writings."
og-type: website
permalink: /writing
nav: none
---

{% for post in site.posts %}
{% if post.categories contains "writing" %}
{% include blog-listing.html %}
{% endunless %}
{% endfor %}

 