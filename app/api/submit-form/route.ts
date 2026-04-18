import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'age', 'email', 'gender', 'interests', 'postcode', 'livingSituation', 'occupation'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // TODO: Save user data to database
    // TODO: Call AI agent to get recommendations
    // TODO: Search for events based on user preferences
    
    // For now, return a success response
    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      data: {
        ...body,
        submittedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
