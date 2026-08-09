import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";



import {
    profileClientService,
} from "@/services/profile-client.service";

import {
    queryKeys,
} from "@/lib/react-query/query-keys";

export function useUpdateLearningGoal() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn: (
            learningGoal: string
        ) =>
            profileClientService
                .updateLearningGoal(
                    learningGoal
                ),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey:
                    queryKeys.dashboard
                        .student,
            });

        },

    });
}