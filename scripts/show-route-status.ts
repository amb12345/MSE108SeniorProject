import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const prisma = new PrismaClient()

async function showRouteStatus() {
  try {
    console.log('🚦 ROUTE STATUS BREAKDOWN\n')
    console.log('============================================================\n')
    
    // Get all decisions
    const decisions = await prisma.decisionData.groupBy({
      by: ['recommended_action'],
      _count: true,
    })
    
    console.log('📊 Decision Actions from Database:\n')
    decisions.forEach(d => {
      console.log(`  ${d.recommended_action}: ${d._count} trucks`)
    })
    
    console.log('\n------------------------------------------------------------\n')
    
    // Get all trucks with their latest decision
    const trucks = await prisma.gpsData.findMany({
      distinct: ['truck_id'],
      select: { truck_id: true },
      orderBy: { truck_id: 'asc' },
    })
    
    console.log('🚚 Individual Truck Status:\n')
    
    let activeCount = 0
    let detourCount = 0
    let completedCount = 0
    
    for (const { truck_id } of trucks.slice(0, 10)) {
      const [gps, decision] = await Promise.all([
        prisma.gpsData.findFirst({
          where: { truck_id },
          orderBy: { timestamp: 'desc' },
        }),
        prisma.decisionData.findFirst({
          where: { truck_id },
          orderBy: { timestamp: 'desc' },
        }),
      ])
      
      let status = 'Unknown'
      let color = '⚪'
      
      // Check at_node from GPS data first - if true, truck is completed
      if (gps?.at_node === true) {
        status = 'Completed'
        color = '⚫'
        completedCount++
      }
      // Not at node - check recommended_action
      else if (decision?.recommended_action === 'continue') {
        status = 'Active'
        color = '🟢'
        activeCount++
      }
      else if (decision?.recommended_action === 'reroute' || decision?.recommended_action === 'detour') {
        status = 'Detour'
        color = '🟡'
        detourCount++
      }
      else {
        status = 'Unknown'
        color = '⚪'
      }
      
      console.log(`  ${color} Truck ${truck_id}: ${status} (at_node=${gps?.at_node || false}, action=${decision?.recommended_action || 'none'})`)
    }
    
    console.log('\n============================================================\n')
    
    console.log('📈 SUMMARY:\n')
    console.log(`  🟢 Active (continue): ${activeCount}`)
    console.log(`  🟡 Detour (reroute): ${detourCount}`)
    console.log(`  ⚫ Completed: ${completedCount}`)
    console.log(`  📊 Total shown: ${activeCount + detourCount + completedCount} of ${trucks.length} trucks`)
    
    console.log('\n✅ Route status query completed!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

showRouteStatus()
