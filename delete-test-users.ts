import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function deleteTestAccounts() {
  console.log("Fetching users to delete...")
  
  let hasMore = true
  let page = 1
  let totalDeleted = 0

  while (hasMore) {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
      page: page,
      perPage: 1000
    })
    
    if (error) {
      console.error("Error fetching users:", error)
      break
    }

    if (users.length === 0) {
      hasMore = false
      break
    }

    const testUsers = users.filter(u => u.email?.includes('teststudent') || u.email?.includes('debug_student'))
    
    for (const user of testUsers) {
      const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
      if (delError) {
        console.log(`Failed to delete ${user.email}:`, delError.message)
      } else {
        totalDeleted++
        console.log(`Deleted ${user.email}`)
      }
    }
    
    // Move to next page if there were users on this page
    if (users.length < 1000) {
      hasMore = false
    } else {
      page++
    }
  }

  console.log(`Cleanup complete! Deleted ${totalDeleted} accounts.`)
}

deleteTestAccounts()
