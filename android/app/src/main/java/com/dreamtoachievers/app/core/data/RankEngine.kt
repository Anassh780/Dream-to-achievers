package com.dreamtoachievers.app.core.data

import com.dreamtoachievers.app.core.model.RankDefinition
import com.dreamtoachievers.app.core.model.RankProgress

object RankEngine {

    val UNRANKED_DEFINITION = RankDefinition(
        id = "rank-unranked",
        name = "Partner Member",
        slug = "silver",
        order = 0,
        requiredSales = 0,
        requiredCommunity = 0,
        rewardAmount = 0.0,
        currency = "PKR",
        accentColor = "silver",
        icon = "User",
        tagline = "Welcome to Dream to Achievers — Complete your first sale to start ranking",
        description = "Your growth journey starts now. Share products, build your community, and qualify for Silver Rank.",
        benefits = listOf(
            "Access to Partner Wholesale Catalog Pricing",
            "Unique Referral Code & Sharing Link",
            "Real-time Sales & Progress Dashboard"
        ),
        isActive = true
    )

    val CANONICAL_RANKS: List<RankDefinition> = listOf(
        RankDefinition(
            id = "rank-silver",
            name = "Silver Rank",
            slug = "silver",
            order = 1,
            requiredSales = 10,
            requiredCommunity = 20,
            rewardAmount = 2000.0,
            currency = "PKR",
            accentColor = "silver",
            icon = "ShieldStar",
            tagline = "Start Your Journey • Build Customer Network • Earn From Product Sales",
            description = "The foundational tier in the Dream to Achievers ecosystem. Achieve 10 qualifying product sales and build a community network of 20 verified members to unlock your first milestone reward.",
            benefits = listOf(
                "PKR 2,000 Milestone Achievement Reward",
                "Standard Partner Purchase Margin Pricing",
                "Access to Official Dream to Achievers Community Channel",
                "Silver Partner Digital Credential Badge",
                "Direct-to-Customer Product Distribution Rights"
            ),
            isActive = true
        ),
        RankDefinition(
            id = "rank-platinum",
            name = "Platinum Rank",
            slug = "platinum",
            order = 2,
            requiredSales = 25,
            requiredCommunity = 45,
            rewardAmount = 4000.0,
            currency = "PKR",
            accentColor = "platinum",
            icon = "Medal",
            tagline = "Grow Your Sales • Expand Your Community • Move to the Next Level",
            description = "Demonstrated momentum and network expansion. Reach 25 product sales and 45 community members to unlock increased achievement rewards and priority partner benefits.",
            benefits = listOf(
                "PKR 4,000 Milestone Achievement Reward",
                "Priority Product Allocation & New Category Drops",
                "Advanced Marketing Collateral & Campaign Playbooks",
                "Platinum Tier Dashboard Badge & Leaderboard Showcase",
                "Accelerated Payout Review Processing"
            ),
            isActive = true
        ),
        RankDefinition(
            id = "rank-gold",
            name = "Gold Rank",
            slug = "gold",
            order = 3,
            requiredSales = 35,
            requiredCommunity = 60,
            rewardAmount = 6000.0,
            currency = "PKR",
            accentColor = "gold",
            icon = "Crown",
            tagline = "Scale Your Product Sales • Build a Strong Community • Achieve Gold",
            description = "High-performing leadership tier. Scale your sales pipeline to 35 verified units and expand your community to 60 members to receive PKR 6,000 reward and exclusive partner perks.",
            benefits = listOf(
                "PKR 6,000 Milestone Achievement Reward",
                "Exclusive Gold Partner Executive Mastermind Invitations",
                "Dedicated Account Manager & Growth Consultation Desk",
                "Featured Spot on Dream to Achievers National Showcase",
                "Custom Branded Marketing Kits & Creative Support"
            ),
            isActive = true
        ),
        RankDefinition(
            id = "rank-diamond",
            name = "Diamond Rank",
            slug = "diamond",
            order = 4,
            requiredSales = 100,
            requiredCommunity = 200,
            rewardAmount = 10000.0,
            currency = "PKR",
            accentColor = "diamond",
            icon = "Diamond",
            tagline = "Lead at Scale • Build a Powerful Community • Reach the Highest Rank",
            description = "The pinnacle of leadership and enterprise scale in Dream to Achievers. Master 100 qualifying product sales and build a thriving 200-member community to claim the top PKR 10,000 milestone reward.",
            benefits = listOf(
                "PKR 10,000 Milestone Achievement Reward",
                "Top-Tier Enterprise Partner Revenue Sharing Access",
                "Lifetime Diamond Recognition & Trophy Credential",
                "Direct Strategy Advisory with Founding Leadership",
                "VIP Access to National Conferences & Gala Events"
            ),
            isActive = true
        )
    )

    fun getAllRanks(): List<RankDefinition> {
        return CANONICAL_RANKS.filter { it.isActive }.sortedBy { it.order }
    }

    /**
     * Evaluates the highest rank achieved by a user given their qualifying sales and community members count.
     * Qualification requires BOTH: sales >= requiredSales AND qualifyingCommunity >= requiredCommunity
     */
    fun evaluateRank(qualifyingSales: Int, qualifyingCommunity: Int): RankDefinition {
        val ranks = getAllRanks()
        var highestRank: RankDefinition = UNRANKED_DEFINITION

        for (rank in ranks) {
            if (qualifyingSales >= rank.requiredSales && qualifyingCommunity >= rank.requiredCommunity) {
                highestRank = rank
            }
        }
        return highestRank
    }

    /**
     * Computes comprehensive user rank progress, including next rank, independent progress bars,
     * missing requirements, and overall percentage completion.
     */
    fun calculateProgress(qualifyingSales: Int, qualifyingCommunity: Int): RankProgress {
        val ranks = getAllRanks()
        val currentRank = evaluateRank(qualifyingSales, qualifyingCommunity)

        val nextRank = if (currentRank.order == 0) {
            ranks.firstOrNull()
        } else {
            ranks.firstOrNull { it.order == currentRank.order + 1 }
        }

        if (nextRank == null) {
            // Maximum rank reached (Diamond)
            return RankProgress(
                currentRank = currentRank,
                nextRank = null,
                qualifyingSales = qualifyingSales,
                qualifyingCommunity = qualifyingCommunity,
                salesProgressPercent = 100,
                communityProgressPercent = 100,
                overallProgressPercent = 100,
                missingSales = 0,
                missingCommunity = 0,
                isMaxRank = true
            )
        }

        val salesProgressPercent = if (nextRank.requiredSales > 0) {
            ((qualifyingSales.toDouble() / nextRank.requiredSales.toDouble()) * 100).toInt().coerceIn(0, 100)
        } else 100

        val communityProgressPercent = if (nextRank.requiredCommunity > 0) {
            ((qualifyingCommunity.toDouble() / nextRank.requiredCommunity.toDouble()) * 100).toInt().coerceIn(0, 100)
        } else 100

        // Both conditions must be satisfied to reach 100%
        val isFullyQualified = qualifyingSales >= nextRank.requiredSales && qualifyingCommunity >= nextRank.requiredCommunity
        val overallProgressPercent = if (isFullyQualified) {
            100
        } else {
            ((salesProgressPercent + communityProgressPercent) / 2).coerceIn(0, 99)
        }

        val missingSales = (nextRank.requiredSales - qualifyingSales).coerceAtLeast(0)
        val missingCommunity = (nextRank.requiredCommunity - qualifyingCommunity).coerceAtLeast(0)

        return RankProgress(
            currentRank = currentRank,
            nextRank = nextRank,
            qualifyingSales = qualifyingSales,
            qualifyingCommunity = qualifyingCommunity,
            salesProgressPercent = salesProgressPercent,
            communityProgressPercent = communityProgressPercent,
            overallProgressPercent = overallProgressPercent,
            missingSales = missingSales,
            missingCommunity = missingCommunity,
            isMaxRank = false
        )
    }
}
