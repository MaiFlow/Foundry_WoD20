import MessageHelper from "./message-helpers.js"

export default class CombatHelper {

    static async RollInitiative(event, actor) {
		event.preventDefault();		

		let foundToken = false;
		let foundEncounter = true;
		let tokenAdded = false;
		let rolledInitiative = false;
		let formula = "1d10";
		let init = 0;
		let label = "";
		let message = "";
		let diceColor;
		let initAttribute = "";

		let token = await canvas.tokens.placeables.find(t => t.data.actorId === actor.id);
		if(token) foundToken = true;

		if (game.combat == null) {
			foundEncounter = false;
	   	}

		let roll = new Roll(formula);		

		roll.evaluate({async:true});
		roll.terms[0].results.forEach((dice) => {
			init += parseInt(dice.result);
		});

		init += parseInt(parseInt(actor.system.initiative.total));

		if ((foundToken) && (foundEncounter)) {
			if (!this._inTurn(token)) {
				await token.toggleCombat();

				if (token.combatant.data.initiative == undefined) {      
					await token.combatant.update({initiative: init});
					rolledInitiative = true;
				}
				
				tokenAdded = true;
			}
		}	

		if (actor.type != CONFIG.wod.sheettype.spirit) {
			if (parseInt(actor.system.attributes.dexterity.total) >= parseInt(actor.system.attributes.wits.total)) {
				initAttribute = game.i18n.localize(actor.system.attributes.dexterity.label) + " " + actor.system.attributes.dexterity.total;
			}
			else {
				initAttribute = game.i18n.localize(actor.system.attributes.wits.label) + " " + actor.system.attributes.wits.total;
			}			
		}
		else {
			initAttribute = game.i18n.localize(actor.system.advantages.willpower.label) + " " + actor.system.advantages.willpower.permanent;
		}

		if (actor.type == CONFIG.wod.sheettype.mortal) {
			diceColor = "blue_";
		} 
		else if ((actor.type == CONFIG.wod.sheettype.werewolf) || (actor.type == "Changing Breed")) {
			diceColor = "brown_";
		}
		else if (actor.type == CONFIG.wod.sheettype.mage) { 
			diceColor = "purple_";
		}
		else if (actor.type == CONFIG.wod.sheettype.vampire) { 
			diceColor = "red_";
		}
		else if (actor.type == CONFIG.wod.sheettype.spirit) { 
			diceColor = "yellow_";
		}
		else {
			diceColor = "black_";
		}	

		roll.terms[0].results.forEach((dice) => {
			label += `<img src="systems/worldofdarkness/assets/img/dice/${diceColor}${dice.result}.png" class="rolldices" />`;
		});
		
		if (!foundEncounter) {
			message += "<em>"+game.i18n.localize("wod.dice.noencounterfound")+"</em>";			
		}
		else {
			if (!foundToken) {
				message += "<em>"+game.i18n.localize("wod.dice.notokenfound")+"</em><br />";				
			}
			else {
				if (!tokenAdded) {
					message += "<em>"+game.i18n.localize("wod.dice.characteradded")+"</em><br />";
					label = "";
					init = "";
				}
				if (!rolledInitiative) {
					message += "<em>" + actor.system.name + " "+game.i18n.localize("wod.dice.initiativealready")+"</em><br />";
					label = "";
					init = "";
				}
			}
		}

		MessageHelper.printMessage('', '<h2>'+game.i18n.localize("wod.dice.rollinginitiative")+'</h2><strong>'+game.i18n.localize("wod.dice.totalvalue") + ': ' + init + '</strong><br />'+initAttribute+'<p>' + label + '</p>' + '<p>' + message + '</p>', actor);			
	}

    static ignoresPain(actor) {
		let ignoresPain = false;

		if (actor.system.conditions?.isignoringpain)
		{
			ignoresPain = true;
		}

		if (actor.system.conditions?.isfrenzy)
		{
			ignoresPain = true;
		}

		return ignoresPain;
	}

    static _inTurn(token) {
		for (let count = 0; count < game.combat.combatants.size; count++) {
			if (token.id == game.combat.combatants.contents[count].token.id) {
				return true;
			}
		}
	
		return false;
	}
}