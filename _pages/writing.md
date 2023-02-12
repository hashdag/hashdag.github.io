---
title: some poems etc
description: "Speak the language of the Hebrew man."
og-type: website
permalink: /writing
nav: none
---

{% for poem in site.poems %}
{% unless poem.categories contains "unlisted" or poem.categories contains "now" %}
{% include poem-listing.html %}
{% endunless %}
{% endfor %}

 
