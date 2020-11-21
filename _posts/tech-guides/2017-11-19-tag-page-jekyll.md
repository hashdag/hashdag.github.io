---
title: How to Make a Tag Page in Jeykll
description: How to use a bit of liquid templating to build a tag page in Jekyll.
syntax: true
tags: jekyll
permalink: /blog/tag-page-jekyll
---

A lot of the tag pages on Jekyll sites rely on plugins. If you're ok with a simple solution that's on a single page, you can build a tag page without any plugins. 

What I wanted was straightforward: 
1. Once created, the tag page is 100% automatic
2. A list of all the tags on the top
3. Each tag links to a list of posts with that tag

## Step 1: Creating the Tag List 

At the top of your tag page, add this Liquid code: 

{% highlight liquid %}{% raw %}
{% assign sortedTags = site.tags | sort %}
{% for tag in sortedTags %}

<a href="#{{tag[0]}}">{{ tag[0] | replace: "-", "&nbsp;" }}&nbsp;({{ tag[1] | size }})</a>

{% endfor %}
{% endraw %}{% endhighlight %}

The first line sorts your tags alphabetically. If you leave off the `sort` filter, you'll get a chronological list.

This also changes `-` to a space and adds how many posts each tag has. 

The most important point is to leave `href="#{{tag[0]}}"` untouched, regardless of how you display or style the text of each tag. 

## Step 2: Making the Post Lists 

This code creates a list of posts for each tag: 

{% highlight HTML %}{% raw %}
<h2 id="{{ tag[0] }}">{{ tag[0] | replace: "-", "&nbsp;" }</h2>

{% for post in tag[1] %}

<a href="{{ post.url }}" title="{{ post.title }}">{{post.title}}</a>

{% endfor %}
{% endraw %}{% endhighlight %}

Don't skip the `id="{% raw %}{{ tag[0] }}{% endraw %}">` since that's where the link points to in the tag list at top of the page. 

Depending on how you want to style each list, you can have  the post links in an `<ul>` or as just links. 

## Step 3: Styling Your Tags 

The barebones HTML will look pretty uninspiring. A little bit of CSS can spruce it up. 

## Resources 

- Take a look at my [tag page](/blog/tags)
- My [Jekyll demo site](https://demo.derekkedziora.com)
- [Source code](https://github.com/derekkedziora/derekkedziora.com/blob/master/_pages/tags.md) for my tag page, [CSS](https://github.com/derekkedziora/derekkedziora.com/blob/master/css/main.scss#L279) for my tag page.

You can always [get in touch](/about#contact) with questions or to show me your tag page. 