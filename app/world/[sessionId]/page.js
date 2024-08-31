import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function Page({ params }) {
    const { sessionId } = params;

    const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

    console.log(data);
    return (
        <div>
            <h2>{params.sessionId}</h2>
            {(() => {
                if (data) {
                    return (
                        <p>{data.game_text}</p>
                    );
                }
            })()}
        </div>
    );
}