import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const params = new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID!,
      client_secret: process.env.STRAVA_CLIENT_SECRET!,
      refresh_token: process.env.STRAVA_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    });

    const res = await fetch("https://www.strava.com/api/v3/oauth/token", {
      method: "POST",
      body: params,
    });
    const tokenData = await res.json();
    const token = tokenData.access_token;
    
    console.log("Token acquired.");
    
    // Fetch a route: 3482310251686164048
    const routeRes = await fetch("https://www.strava.com/api/v3/routes/3482310251686164048", {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    const routeData = await routeRes.json();
    console.log("Segments array present?", !!routeData.segments);
    if (routeData.segments) {
        console.log("Number of segments:", routeData.segments.length);
        const topSegments = routeData.segments.sort((a,b) => (b.elevation_high - b.elevation_low) - (a.elevation_high - a.elevation_low)).slice(0,3);
        console.log("Top 3 segments by elevation:", topSegments.map(s => ({ name: s.name, elev: s.elevation_high - s.elevation_low, distance: s.distance })));
    }
}

run().catch(console.error);
