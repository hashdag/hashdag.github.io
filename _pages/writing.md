---
title: some poems etc
description: "Speak the language of the Hebrew man."
og-type: website
permalink: /writing
nav: none
---

{% for post in site.posts %}
{% unless post.categories contains "unlisted" or post.categories contains "now" %}
{% include post-listing.html %}
{% endunless %}
{% endfor %}

 
