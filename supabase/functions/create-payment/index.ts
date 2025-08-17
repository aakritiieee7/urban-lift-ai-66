import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { shipmentData, distanceKm } = await req.json();
    
    // Calculate payment amount based on weight and distance
    // Base rate: ₹10 per kg + ₹5 per km
    const weightCost = shipmentData.capacity_kg * 10; // ₹10 per kg
    const distanceCost = distanceKm * 5; // ₹5 per km
    const totalAmount = Math.round(weightCost + distanceCost); // Amount in rupees
    
    console.log(`Payment calculation: Weight(${shipmentData.capacity_kg}kg) = ₹${weightCost}, Distance(${distanceKm}km) = ₹${distanceCost}, Total = ₹${totalAmount}`);

    // Simulate Razorpay order creation (fake API)
    const fakeOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create fake Razorpay order response
    const fakeOrder = {
      id: fakeOrderId,
      amount: totalAmount * 100, // Razorpay expects amount in paise
      currency: "INR",
      status: "created",
      receipt: `receipt_${Date.now()}`,
      created_at: Math.floor(Date.now() / 1000)
    };

    // Store payment transaction in database
    const { data: paymentTransaction, error: paymentError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        amount: totalAmount,
        currency: 'INR',
        payment_method: 'razorpay',
        payment_id: fakeOrderId,
        payment_status: 'created'
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment transaction:', paymentError);
      throw new Error('Failed to create payment transaction');
    }

    return new Response(JSON.stringify({
      success: true,
      order: fakeOrder,
      amount: totalAmount,
      currency: "INR",
      transactionId: paymentTransaction.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in create-payment function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});