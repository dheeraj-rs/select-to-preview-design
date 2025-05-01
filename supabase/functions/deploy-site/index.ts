// Follow Supabase Edge Function format
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeployRequest {
  projectId: string;
  siteName?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Get request body
    const { projectId, siteName }: DeployRequest = await req.json()

    // Get project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      throw new Error('Project not found')
    }

    // Create Netlify site if it doesn't exist
    let siteId = project.netlify_site_id
    if (!siteId) {
      // Create new site on Netlify
      const netlifyResponse = await fetch('https://api.netlify.com/api/v1/sites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('NETLIFY_ACCESS_TOKEN')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: siteName || `nexus-site-${projectId}`,
          custom_domain: null,
        }),
      })

      if (!netlifyResponse.ok) {
        throw new Error('Failed to create Netlify site')
      }

      const netlifyData = await netlifyResponse.json()
      siteId = netlifyData.id

      // Update project with Netlify site ID
      await supabase
        .from('projects')
        .update({ netlify_site_id: siteId })
        .eq('id', projectId)
    }

    // Generate site files
    // This would be your existing export logic, modified to return files instead of creating a zip
    const files = generateSiteFiles(project.components)

    // Deploy to Netlify
    const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('NETLIFY_ACCESS_TOKEN')}`,
        'Content-Type': 'application/zip',
      },
      body: await createDeploymentZip(files),
    })

    if (!deployResponse.ok) {
      throw new Error('Failed to deploy to Netlify')
    }

    const deployData = await deployResponse.json()

    // Update project with published URL
    await supabase
      .from('projects')
      .update({ published_url: deployData.url })
      .eq('id', projectId)

    return new Response(
      JSON.stringify({ 
        url: deployData.url,
        siteId: siteId,
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})

function generateSiteFiles(components: any[]) {
  // Implementation of your existing export logic
  // Returns an object mapping file paths to content
  return {}
}

async function createDeploymentZip(files: Record<string, string>) {
  // Create ZIP file for deployment
  // Returns ZIP file as ArrayBuffer
  return new ArrayBuffer(0)
}