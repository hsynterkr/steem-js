var moment = require('moment'),
	steemAuth = require('../../steemauth/index.js'),
	steemApi = require('./api');
	formatter = require('./formatter');

/*
vote: 0,
comment: 1,
transfer: 2,

TODO
transfer_to_vesting: 3,
withdraw_vesting: 4,
limit_order_create: 5,
limit_order_cancel: 6,
feed_publish: 7,
convert: 8,
account_create: 9,
account_update: 10,
witness_update: 11,
account_witness_vote: 12,
account_witness_proxy: 13,
pow: 14,
custom: 15,
report_over_production: 16,
delete_comment: 17,
custom_json: 18,
comment_options: 19,
set_withdraw_vesting_route: 20,
limit_order_create2: 21,
challenge_authority: 22,
prove_authority: 23,
request_account_recovery: 24,
recover_account: 25,
change_recovery_account: 26,
escrow_transfer: 27,
escrow_dispute: 28,
escrow_release: 29,
fill_convert_request: 30,
comment_reward: 31,
curate_reward: 32,
liquidity_reward: 33,
interest: 34,
fill_vesting_withdraw: 35,
fill_order: 36,
comment_payout: 37
*/

module.exports = {
	send: function(tx, privKeys, callback) {
		steemApi.login('', '', function() {
			steemApi.getDynamicGlobalProperties(function(err, result) {
				tx.expiration = moment.utc(result.timestamp).add(15, 'second').format().replace('Z', '');
				tx.ref_block_num = result.head_block_number & 0xFFFF;
				tx.ref_block_prefix =  new Buffer(result.head_block_id, 'hex').readUInt32LE(4);
				var signedTransaction = steemAuth.signTransaction(tx, privKeys);
				steemApi.broadcastTransactionWithCallback(function(){}, signedTransaction, function(err, result) {
					callback(err, result);
				});
			});
		});
	},
	vote: function(wif, voter, author, permlink, weight, callback) {
		var tx = {
			extensions: [],
			operations: [['vote', {
				voter: voter,
				author: author,
				permlink: permlink,
				weight: weight
			}]]
		};
		this.send(tx, {posting: wif}, function(err, result) {
			callback(err, result);
		})
	},
	upvote: function(wif, voter, author, permlink, weight, callback) {
		weight = weight || 10000;
		vote(wif, author, permlink, weight, function(err, result) {
			callback(err, result);
		})
	},
	downvote: function(wif, voter, author, permlink, weight, callback) {
		weight = weight || 10000;
		vote(wif, author, permlink, -Math.abs(weight), function(err, result) {
			callback(err, result);
		})
	},
	comment: function(wif, parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata, callback) {
		permlink = permlink || formatter.commentPermlink(parentAuthor, parentPermlink);
		var tx = {
			extensions: [],
			operations: [['comment', {
				parent_author: parentAuthor,
				parent_permlink: parentPermlink,
				author: author,
				permlink: permlink,
				title: title,
				body: body,
				json_metadata: JSON.stringify(jsonMetadata)
			}]]
		};
		this.send(tx, {posting: wif}, function(err, result) {
			callback(err, result);
		})
	},
	transfer: function(wif, from, to, amount, memo, callback) {
		var tx = {
			extensions: [],
			operations: [['transfer', {
				from: from,
				to: to,
				amount: amount,
				memo: memo
			}]]
		};
		this.send(tx, {active: wif}, function(err, result) {
			callback(err, result);
		})
	},
	transfer_to_vesting: function(wif, from, to, amount, callback) {
		var tx = {
			extensions: [],
			operations: [['transfer_to_vesting',{
				from: from,
				to: to,
				amount: amount
			}]]
		};
		this.send(tx, {active: wif}, function(err, result) {
			callback(err, result);
		})
	},
	withdraw_vesting: function(wif, account, vestingShares, callback) {
		var tx = {
			extensions: [],
			operations: [['withdraw_vesting',{
				account: account,
    				vesting_shares: vestingShares
			}]]
		};
		this.send(tx, {active: wif}, function(err, result) {
			callback(err, result);
		})
	}

};