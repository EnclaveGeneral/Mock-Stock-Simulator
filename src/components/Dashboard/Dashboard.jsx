import { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { getUserProfile, createUserProfile } from '../../services/dynamodbService';

function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function testDynamoDB() {
            try {
                // Get current user from Cognito
                const user = await getCurrentUser();
                console.log("Cognito User:", user);

                // Try to get their profile from DynamoDB
                const profile = await getUserProfile(user.userId);
                console.log("DynamoDB Profile:", profile);

                setUserProfile(profile);
                setLoading(false);
            } catch (err) {
                console.error("Error:", err);
                setError(err.message);
                setLoading(false);
            }
        }

        testDynamoDB();
    }, []);

    if (loading) {
        return <div><h1>Loading...</h1></div>;
    }

    if (error) {
        return (
            <div>
                <h1>Error</h1>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Dashboard Page</h1>
            {userProfile ? (
                <div>
                    <p>Welcome, {userProfile.displayUsername}!</p>
                    <p>Cash Balance: ${userProfile.cashBalance}</p>
                </div>
            ) : (
                <p>No profile found - first time login detected</p>
            )}
        </div>
    );
}

export default Dashboard;