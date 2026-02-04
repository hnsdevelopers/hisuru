import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend@2.0.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

interface UserReport {
  email: string
  full_name: string
  user_id: string
}

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Get all users who want daily reports
    const { data: users, error: usersError } = await supabase
      .from('user_settings')
      .select(`
        email_notifications,
        users!inner (
          id,
          email,
          full_name
        )
      `)
      .eq('email_notifications->>daily_reports', 'true')
    
    if (usersError) throw usersError
    
    const reportUsers: UserReport[] = users
      .filter(setting => setting.email_notifications?.daily_reports)
      .map(setting => ({
        email: setting.users.email,
        full_name: setting.users.full_name,
        user_id: setting.users.id
      }))

    // 2. Generate and send reports for each user
    const results = []
    for (const user of reportUsers) {
      // Get user's daily stats
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      
      const { data: stats, error: statsError } = await supabase
        .from('user_daily_stats')
        .select('*')
        .eq('user_id', user.user_id)
        .gte('date', yesterday)
        .lte('date', today)
        .order('date', { ascending: false })

      if (statsError) {
        console.error(`Error getting stats for ${user.email}:`, statsError)
        continue
      }

      // Generate HTML report
      const todayStats = stats.find(s => s.date === today) || {}
      const yesterdayStats = stats.find(s => s.date === yesterday) || {}

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
            .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .stat-value { font-size: 28px; font-weight: bold; color: #4F46E5; margin: 10px 0; }
            .stat-label { color: #666; font-size: 14px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .improvement { color: #10B981; }
            .decline { color: #EF4444; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Your Daily HiSuru Report</h1>
              <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div class="content">
              <p>Hello ${user.full_name},</p>
              <p>Here's your productivity report for today:</p>
              
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">${todayStats.tasks_completed || 0}</div>
                  <div class="stat-label">Tasks Completed</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${todayStats.meetings_attended || 0}</div>
                  <div class="stat-label">Meetings Attended</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${todayStats.emails_sent || 0}</div>
                  <div class="stat-label">Emails Sent</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${todayStats.focus_time || '0'}h</div>
                  <div class="stat-label">Focus Time</div>
                </div>
              </div>
              
              <h3>📈 Yesterday vs Today</h3>
              <p>Tasks completed: ${yesterdayStats.tasks_completed || 0} → ${todayStats.tasks_completed || 0} 
                ${todayStats.tasks_completed > (yesterdayStats.tasks_completed || 0) ? 
                  '<span class="improvement">↑ Improvement</span>' : 
                  '<span class="decline">↓ Decline</span>'}
              </p>
              
              <h3>🎯 Top Priorities for Tomorrow</h3>
              <ul>
                <li>Complete pending tasks</li>
                <li>Prepare for scheduled meetings</li>
                <li>Review team updates</li>
              </ul>
              
              <p style="margin-top: 30px;">
                <a href="${Deno.env.get('APP_URL')}/dashboard" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Full Dashboard</a>
              </p>
            </div>
            <div class="footer">
              <p>You're receiving this email because you subscribed to daily reports.</p>
              <p><a href="${Deno.env.get('APP_URL')}/settings/notifications">Manage notifications</a></p>
              <p>© ${new Date().getFullYear()} HiSuru. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `

      // Send email
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'HiSuru Reports <reports@hisuru.com>',
        to: user.email,
        subject: `Your Daily HiSuru Report - ${today}`,
        html: html,
      })

      if (emailError) {
        console.error(`Error sending email to ${user.email}:`, emailError)
        results.push({ email: user.email, success: false, error: emailError })
      } else {
        console.log(`Report sent to ${user.email}`)
        results.push({ email: user.email, success: true })
        
        // Log email sent in database
        await supabase
          .from('email_logs')
          .insert({
            user_id: user.user_id,
            email_type: 'daily_report',
            sent_at: new Date().toISOString(),
            status: 'sent'
          })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Reports sent to ${results.filter(r => r.success).length} users`,
        results 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Daily report function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})