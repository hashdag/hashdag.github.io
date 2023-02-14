---
title: In which we'll bе reduced to a spectrum of gray*
description: "A thesis about Ethereum's rollup-centric future, and a potential supernova event"
tags: crypto kaspa
permalink: /blog/supernova
categories: blog
---

### Why is Ethereum Ethereum

Sure, Ethereum is great and all, but why? What exactly made it into this vibrant and innovative ecosystem? And can it last? I’m writing this post in an attempt to clarify to self and pinpoint Ethereum’s unique value offering and the emergent decentralized finance ecosystem.

Ethereum’s success is commonly ascribed to its *composability*, the ability to compose one smart contract on top of another like lego boxes, leaving little-to-no need for development coordination, as once a dev team deployed a smart contract, any other smart contract can access it, permissionlessly. However, while Ethereum does harvest the power of openness and permissionlessness to reuse, extend, and compose different code bases and code components -- this is by no means new or unique, it characterizes general open source values and structure. Almost by definition, open source allows one to build software composed of several code bases and libraries developed by others. So *shared functionality*, or composability of functionalities, isn’t precising the matter.

### Composability - everyone’s talking about it

The composability everyone’s referring to is, I suppose, the ability to compose different functionalities while acting *on and inside the same state*. Ethereum combines open source shared functionality with Nakamoto Consensus to enable *shared alterable state*.

Without this shared state, the DeFi movement is reduced to a rising demand for using financial products that offer permissionless access to open APIs which communicate over a shared network (otherwise known as: the internet). If it was just transparent finance and open APIs, users wouldn’t be able to issue transactions that access several dapps or financial products simultaneously in a manner whose consequences are predictable and pre-understood. Rather, they would need to transact separately with each dapp, and while these interactions could be automated, the cascade of events across these composable contracts wouldn’t be predictable.

And Ethereum is a game changer for DeFi precisely because it enables predictable cascading transactions, transactions of the form “Alice locks Token Ali and Token Baba in the autonomous contract Compos, Compos increases its pool of Token Ali and Baba, their respective exchange rates adjust, and Alice is added to the list of shareholders benefiting from fees collected by Compos” -- all these assertions necessarily happening together (or together not happening). This property is known as *atomicity*, namely, the guarantee that a set of events and consequences will happen or not happen together. Let your imagination be carried with these endless composability options and you’re on the right track to becoming a DeFi dev.

Of course, transparent and permissionless finance is still an improvement over traditional finance, but these do not capture Ethereum’s ecosystem and the flywheel responsible for growing its network effect.

### Ethereum’s CAP

In this section I want to illustrate and emphasize that *composability + shared state = synchronous composability*. Indeed, acting on a shared consensus state effectively requires that each transaction at its turn locks the state, *fully executes*, and completes its full update of the state, as in the Alice and Compos example above.


<figure><img src="/static/asynccompose.png" loading="lazy" />
</figure>

To press this point further, and to start unfolding Ethereum’s roadmap, imagine an Ethereum variant where synchronous composability is violated; as we will see, unfortunately this thought experiment is not hypothetical, and there are good chances Ethereum is going down this road. We’ll come back to this shortly. Concretely, imagine that smart contracts wouldn’t communicate synchronously. That is, smart contracts would still be composable in the sense that they automatically interact with each other and trigger mutual function calls, but these function calls do not happen at the same transaction or block, rather, in this for-now-hypothetical Ethereum, it’d a few hours or days for one contract to consider and update upon messages sent by other contracts.

It is highly questionable that such a system would be an impactful dapp platform as Ethereum has become. Among other difficulties, one obvious one is the great degree of unpredictability and indeterminism in the hours/days delayed execution of the transaction -- the violation of synchronous composability is a violation of atomicity and in turn of predictability: The consequence of the cascade of events triggered by a transaction would be prohibitively unpredictable.

While Ethereum users already suffer from some degree of uncertainty regarding the outcome of their transactions -- a caveat inherent to acting inside a shared asynchronous environment -- delaying parts of the execution for hours, let alone days, would make it rarely useful to issue rich composite transactions.

Following these observations, and returning to Ethereum’s original shared state principle, 
we may conclude that Ethereum’s main value proposition is not mere composability, rather, synchronous composability, i.e., the ability to compose different functionalities while acting on and inside the same state.

So far so good, we can summarize Ethereum as satisfying CAP: Composability, Atomicity, Predictability. (The *CAP theorem* is anyways lame and should be abused in good conscience.)

### The bad news

But shared state is inherently unscalable, as every individual transaction imposes externality costs on the entire network. This is the why and what of *sharding* -- splitting the state across different zones so that a transaction imposes a computational burden on the validators of its shard only.

Almost any proposed roadmap for scaling Ethereum contains, in one way or another, sharding. While sharding is connotated with the Eth 2.0 vision, the updated [rollups-vision for scaling Ethereum](https://ethereum-magicians.org/t/a-rollup-centric-ethereum-roadmap/4698) will silo the state across different rollups. (I use *siloing* to describe spontaneous grouping of smart contracts and validators, to distinguish it from random uniform allocation of validators, as in classical sharding.)

The by-design independence of a rollup (or shard) implies that its state can depend on events of another rollup only after the latter’s state reached finality. From rollup Y’s perspective, we replace the question “Is the state of rollup X correct?” with “Is the state of rollup X finalized”, which is sufficient for rollup Y and the system as a whole to operate and cooperate (users of rollup Y do not care, at least in the micro level, if the state of rollup X was corrupted).

This means that transactions that touch a few smart contracts, across different rollups, will need to wait for a long time before they are fully executed -- if Alice’s tokens are managed in rollup X, and Compos is managed in rollup Y, the execution of Alice’s transaction will begin in rollup X, then wait for its finality, and only then complete inside rollup Y.
 
We reached the crux of rollup-centric Ethereum’s composability problem:

*The finality delay of the underlying sharding system dictates the degree of asynchrony, and with it the degree of unpredictability of transaction execution.*

If we had finality periods of 2 seconds, as in Cosmos’ utilization of tendermint (which is not for free, stronger assumptions are made), you can argue that maybe async composability is useful. But with optimistic-rollups, the finality is said to be hours or days long, maybe even weeks. This renders async composability useless for an optimistic-rollups-centric Ethereum.[^1]

Folks have proposed to circumvent the finality delay using cross-rollup liquidity providers (LPs). The solution is designed for fungible assets only, and it operates as follows:
1. Alice wishes to withdraw her funds from rollup X and transfer them to rollup Y (or to a base layer).
2. Alice contacts an LP that has sufficient funds in the relevant fungible token, on both rollups. 
3. Alice sends her token to LP, on rollup X.
4. LP sends Alice the same amount of the corresponding token (minus a commission), on rollup Y. 

The transactions in steps 3 and 4 are executed immediately on rollups X and Y, respectively, but are actionable outside each rollup only after the finality delay. (BTW, similarly to trustless staking pools, trustless liquidity pools don’t make sense. Happy to help.)

### Ethereum future.0

After this deliberation, and reflecting on the possible outcomes, I see few possibilities for the Ethereum system henceforth:

Monopolistic Scenario: One rollup takes it all, sync composability wins, sharding loses. In this path, there is a scalability gain from decoupling computation from data availability (the former handled by the rollup, the latter by base consensus), which is somewhat beneficial, but users’ transactions still impose full externalities on the entire network, so state bloat is not addressed. Since different rollups introduce different assumptions (e.g., ZKRUs don’t rely on censorship resistance for correctness), one winner takes it all could be more risky.

I will elaborate on why this is still somewhat beneficial in another post.

Optimistic Scenario: Multiple rollups thrive, sync composability is ruined, async composability is useless, Ethereum network is fragmented into rollup subnetworks, and liquidity providers facilitate the interoperability of the subnetworks with respect to fungible tokens.

Ethereum’s base layer would remain the kernel of the ecosystem, its settlement layer, serving the dispute resolution (DR) and snark/stark verification functionalities, and potentially the data availability (DA) one as well. While Ethereum’s base consensus is okay for DR, these scenarios would/should probably lead to using a different DA layer that is optimized for this functionality; Vitalik half-jokingly once suggested BCH as a candidate, and some side-chain projects offer their own DA layer. (This topic is outside the scope of this post, but do remind me to tell you about the ideal requirements from a DA layer, in light of the MEV crisis. Thanks.) 

All hell breaks loose scenario: A supernova event. With the ecosystem being built on the foundations of a shared state kernel, and with this kernel losing its power due to the unscalability and surging gas prices, natural and genuine forces in the community will clash amid efforts to coordinate migration into specific rollups, and recenter around a shared state. Considering the size of the community, coordinating migration will fail, clashes will increase, and the system and its original vision will collapse onto itself, leading to what I dub a supernova of the Ethereum giant.

The network effect of Ethereum as a cohesive ecosystem will evaporate into the ether, and the remnants of this event would form few to many subnetworks interoperating through designated LPs, ignoring or skipping Ethereum’s base layer, implementing their own data availability and dispute resolution layers. Sociodevologically, projects and devs would still identify themselves as hardcore Ethereans. However, the social consensus around this identity, and the legitimacy of proclaiming it, will naturally fracture.

“The world will spin and the color will fade, and we’ll be reduced to a spectrum of gray.”


---
<br>
**Notes**

\* [Title reference](https://www.youtube.com/watch?v=aJS5-0hyVA8)

[^1]: In contrast to optimistic rollups, ZKRUs rely on (the stronger) validity proofs, and do not require therefore a finality delay. However, there is some delay until proofs are generated, and the tech seems infeasible as a short-to-mid term solution for general purpose smart contracts. Efforts here are pioneered by MatterLabs and Starkware.
