---
title: Dark Mode Revisited
description: "Now that dark mode is supported on every browser out of the box, implementing it with CSS has changed."
category: tech-guide
tags: jekyll
permalink: /blog/dark-mode-revisited
syntax: true 
---

Dark mode has gone from an oddity to being fully supported on Safari, Firefox and Chrome. While this is great news (especially if you also get migraines), it also means that my previous dark mode post from less than a year ago is outdated. 

Time for round two. 

<section class="aside"> 
<h3>A Caveat</h3>
<p>This is more of a guided heuristic that assumes some knowledge of CSS. You can copy and paste the javascript, but you still need to manually set colors in your CSS.</p>
</section>

The basic concept is still the same. I need both a dark and light mode that works on my static Jekyll site. I still don’t want to use cookies while having a switch that keeps dark or light mode consistent. I also don’t want a light or dark flash when navigating between pages. 


## What’s changed

Every major browser supports the CSS media query `@media (prefers-color-scheme: dark)`. This should now be the primary deciding factor in whether to display a site in light or dark mode. 

Before I used local storage to permanently save someone’s preferences. This has flaws. I might open a site in the morning on my way to work and revisit it in the evening at home with different theme preferences. 

Another positive change is more and more themes for major site generators already have a dark mode built into them. If you aren’t using or a theme or built your own, read on. 

## Step one: CSS variables everywhere

You can no longer hardcode colors into CSS if you want to switch between themes. Instead every color has to be declared with a variable. 

Your CSS should look like this:
{% highlight CSS  %}background-color: var(--background-color);{% endhighlight %}

Don’t do this:
 {% highlight CSS  %}background-color: white;{% endhighlight %}
 
## Simplicity: the buttonless solution 
 
In the HTML element declare all of your light mode variables. It should look something like this: 

{% highlight CSS  %}
html { 
	--light-text-color: rgb(72, 72, 74);
  	--link-color: rgb(0, 112, 201);
  	--main-background-color: rgb(255, 255, 255);
  	--main-text-color: rgb(51, 51, 51);
}{% endhighlight %}

Then create a media query for dark mode and declare your variables for dark mode.

{% highlight CSS  %}
@media (prefers-color-scheme: dark) {
	html {
		--light-text-color: rgb(199, 199, 204);
  		--link-color: rgb( 100, 210, 255);
  		--main-background-color: rgb(28, 28, 30);
  		--main-text-color: rgb(229, 229, 234);
	}
}{% endhighlight %}

For most sites this is all you really need. The site’s color scheme  will always match the device’s. This is elegant, works without javascript and requires only rudimentary CSS skills. 

<section markdown="1" class="aside">
### Simplifying this site 
I eventually removed the override button from my site. A CSS media query covers nearly every use case, plus it’s one less bit of clutter and JS. I made a [demo site](https://demo.derekkedziora.com) that still had a button so you can see how it works. 
</section>


## The override button 

I prefer to always have my computer set to dark mode but find it easier to read longer texts in light mode. To accommodate this, a site would need a button or switch to override the system preferences  

{% highlight CSS  %}
html, html[data-theme="light"] { 
	--light-text-color: rgb(72, 72, 74);
  	--link-color: rgb(0, 112, 201);
  	--main-background-color: rgb(255, 255, 255);
  	--main-text-color: rgb(51, 51, 51);
}

html[data-theme="dark"] {
		--light-text-color: rgb(199, 199, 204);
  		--link-color: rgb( 100, 210, 255);
  		--main-background-color: rgb(28, 28, 30);
  		--main-text-color: rgb(229, 229, 234);
	}

@media (prefers-color-scheme: dark) {
	html, html[data-theme="dark"] {
		--light-text-color: rgb(199, 199, 204);
  		--link-color: rgb( 100, 210, 255);
  		--main-background-color: rgb(28, 28, 30);
  		--main-text-color: rgb(229, 229, 234);
	}
	
	html[data-theme="light"] { 
	--light-text-color: rgb(72, 72, 74);
  	--link-color: rgb(0, 112, 201);
  	--main-background-color: rgb(255, 255, 255);
  	--main-text-color: rgb(51, 51, 51);
	}
}{% endhighlight %}

We’re still using CSS to detect what color scheme is set in the system the preferences. To override this, we use javascript to change the `<html>` tag to `<html data-theme="dark">` (or light). This then sets the variables using the non-system color scheme. 

Next we need a button that will do this for us: 

{% highlight HTML %}
<a id="theme-toggle" onclick="modeSwitcher()"></a>{% endhighlight %}

## The Javascript 

At the bottom of each page you need this chunk of javascript. This will cause your page to switch back and forth according to the reader’s system preferences while allowing them to override those preferences. 

First, we need to figure out what mode the page is currently in. It’s not so easy to find out what’s been computed, instead I use two indirect ways: 

{% highlight JavaScript %}
// this checks whether system dark mode is set 
let systemInitiatedDark = window.matchMedia("(prefers-color-scheme: dark)"); 
// this checks for session storage telling to override
// the system preferences 
let theme = sessionStorage.getItem('theme');
{% endhighlight %}

Based on the current mode, I display the text of the button as either light or dark mode: 

{% highlight JavaScript %}
if (systemInitiatedDark.matches) {
	document.getElementById("theme-toggle").innerHTML = "Light Mode";
} else {
	document.getElementById("theme-toggle").innerHTML = "Dark Mode";
}{% endhighlight %}

Next, I added an event listener to detect if the system preferences change. This changes the site to match the system preferences. 

{% highlight JavaScript %}
function prefersColorTest(systemInitiatedDark) {
  if (systemInitiatedDark.matches) {
  	document.documentElement.setAttribute('data-theme', 'dark');		
   	document.getElementById("theme-toggle").innerHTML = "Light Mode";
   	// this clears the session storage 
   	sessionStorage.setItem('theme', '');
  } else {
  	document.documentElement.setAttribute('data-theme', 'light');
    document.getElementById("theme-toggle").innerHTML = "Dark Mode";
    sessionStorage.setItem('theme', '');
  }
}
systemInitiatedDark.addListener(prefersColorTest);
{% endhighlight %}

The next function is called if mode switching mode is clicked. It overrides the system preferences using session storage. This keeps the theme consistent as you navigate around the site. The reason I opted for session storage rather than local storage, is that I still assume it’s more likely you’ll want to match your system preferences when you return. If not, it’s a single click to change it back to override the system preferences. 

The function works by first figuring out which of the four possible states the mode is in: 

1. User selected dark mode (overridden)   
2. User selected light mode (overridden)
3. System set light mode
4. System set dark mode 

Then the desired CSS is used by changing `<html data-theme="dark / light">`, session storage set and the text of the button changed.  

{% highlight JavaScript %}
function modeSwitcher() {
// it’s important to check for overrides again 
	let theme = sessionStorage.getItem('theme');
	// checks if reader selected dark mode 
	if (theme === "dark") {
		document.documentElement.setAttribute('data-theme', 'light');
		sessionStorage.setItem('theme', 'light');
		document.getElementById("theme-toggle").innerHTML = "Dark Mode";
		// checks if reader selected light mode 
	}	else if (theme === "light") {
		document.documentElement.setAttribute('data-theme', 'dark');
		sessionStorage.setItem('theme', 'dark');
		document.getElementById("theme-toggle").innerHTML = "Light Mode";
		// checks if system set dark mode 
	} else if (systemInitiatedDark.matches) {	
		document.documentElement.setAttribute('data-theme', 'light');
		sessionStorage.setItem('theme', 'light');
		document.getElementById("theme-toggle").innerHTML = "Dark Mode";
		// the only option left is system set light mode
	} else {
		document.documentElement.setAttribute('data-theme', 'dark');
		sessionStorage.setItem('theme', 'dark');
		document.getElementById("theme-toggle").innerHTML = "Light Mode";
	}
}{% endhighlight %}

The last section checks if there is local storage set to override the system set theme. It’s important that this section come last, otherwise the event listener will always win out and display the system color mode. 

{% highlight JavaScript %}
if (theme === "dark") {
	document.documentElement.setAttribute('data-theme', 'dark');
	sessionStorage.setItem('theme', 'dark');
	document.getElementById("theme-toggle").innerHTML = "Light Mode";
} else if (theme === "light") {
	document.documentElement.setAttribute('data-theme', 'light');
	sessionStorage.setItem('theme', 'light');
	document.getElementById("theme-toggle").innerHTML = "Dark Mode";
}{% endhighlight %}

I’ve tested this on Safari, Firefox and Chrome plus iOS without any issues. 

The biggest potential problem would be a flash of the non-desired theme while your page is loading when the reader has selected to override the system preferences. Since this runs last in the code, it could take a split second to run if your site has a slow load time. If you’re using a static site generator like Jekyll, Hugo or Gatsby that shouldn’t be a problem. 

If you do notice it though, add the last section of code to the top of your page as well as keeping it at the bottom. This will load the overridden theme first and when the event listener tries to overrule it, the last section of code will cancel it out. 

## The complete code 

You can check out my complete [CSS code](https://github.com/derekkedziora/jekyll-demo/blob/master/css/main.scss) and the entire section of [javascript](https://github.com/derekkedziora/jekyll-demo/blob/master/scripts/mode-switcher.js) without comments. Feel free to copy and paste. Or if you prefer to see it in context, here’s the [entire repo on GitHit](https://github.com/derekkedziora/jekyll-demo) and my [demo site](https://demo.derekkedziora.com). 

Happy dark moding! 🤓